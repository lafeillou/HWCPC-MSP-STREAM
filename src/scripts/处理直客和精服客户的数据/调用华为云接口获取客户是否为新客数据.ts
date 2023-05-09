// 判断直客、精服的客户是否为NA
import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { CustomerTemp } from "../../entity/Customer_temp";
import { request } from "../../utils/request";
import * as _ from "lodash";
import { exit } from "process";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getNaInfo(params, token) {
  return new Promise(async (resolve, reject) => {
    const result: any = await request({
      method: "get",
      url: "https://bss.myhuaweicloud.com/v2/settlements/new-customers-tags/smb",
      headers: {
        "X-Auth-Token": token,
      },
      params,
    })
      .then((res) => res)
      .catch((err) => {
        // reject(err);
        console.log(err);
        resolve({
          customer_id: params.customer_id,
          newCustomerStatus: null,
          newCustomerRecord: null,
          isNewCustomer: null,
        });
      });

    if (result) {
      // 异步写入数据库
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(CustomerTemp)
        .values({
          customer_id: params.customer_id,
          isNewCustomer: result.new_customer_tag === "Y" ? 1 : 0,
          newCustomerStatus: result.new_customer_tag,
          newCustomerRecord: {
            expire_time: result.expire_time,
            effective_time: result.effective_time,
            new_customer_tag: result.new_customer_tag,
          },
          customerType: params.customerType,
          updateTime: dayjs().format("YYYY-MM-DD"),
        })
        .orUpdate(
          [
            "newCustomerStatus",
            "newCustomerRecord",
            "isNewCustomer",
            "updateTime",
          ],
          ["updateTime", "customer_id"]
        )
        .execute();
      resolve({
        customer_id: params.customer_id,
        newCustomerStatus: result.new_customer_tag,
        newCustomerRecord: {
          expire_time: result.expire_time,
          effective_time: result.effective_time,
          new_customer_tag: result.new_customer_tag,
        },
        isNewCustomer: result.new_customer_tag === "Y" ? 1 : 0,
      });
    }
  });
}

function createRequest(tasks, pool) {
  // 每次控制的发送请求的数量pool
  pool = pool || 5;
  // 用于存储每一次请求的结果(按顺序进行存储)
  let results = [];
  // together用于创建工作区,当pool传入的是几，我们就对应的创建几个工作区
  // 也就是创建一个长度为pool且值为null的一个数组
  let together = new Array(pool).fill(null);
  // index为每次获取的任务值
  let index = 0;

  together = together.map(() => {
    return new Promise((resolve, reject) => {
      const run = function run() {
        // 如果任务池已经空了，说明请求发送完成了，直接成功
        if (index >= tasks.length) {
          resolve(true);
          return;
        }

        let old_index = index;
        let task = tasks[index++];

        task()
          .then((result) => {
            // console.log(result);
            results[old_index] = result;
            run();
          })
          .catch((err) => {
            reject(err);
          });
      };
      run();
    });
  });
  return Promise.all(together)
    .then(() => results)
    .catch((err) => {
      console.log(err);
    });
}

(async () => {
  console.time("调用华为云接口获取客户是否为新客数据");
  await AppDataSource.initialize(); // 每一次都得执行
  // 获取token
  const iamUsers = await await AppDataSource.getRepository(IamUser)
    .createQueryBuilder("iamUsers")
    .where("iamUsers.status = :status", { status: 1 }) // 在用的账号
    .orderBy("iamUsers.sort", "ASC") // 按照排序来，一般重点区域排在前面
    .getMany();

  const bpTokenMap = {};
  _.forEach(iamUsers, (u) => {
    bpTokenMap[u.bpId] = u.token;
  });

  // 获取某一个bp下所有的客户
  const customers = await AppDataSource.getRepository(CustomerTemp)
    .createQueryBuilder("customer_temp")
    .getMany();

  const tasksArr = [];

  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    tasksArr.push(() =>
      getNaInfo(
        {
          customer_id: c.customer_id,
          customerType: c.customerType,
        },
        bpTokenMap[c.bpId]
      )
    );
  }

  // tasksArr 中有超过1万个ajax请求任务
  const results = await createRequest(tasksArr, 1);
  console.timeEnd("调用华为云接口获取客户是否为新客数据");
  exit(1);
})();
