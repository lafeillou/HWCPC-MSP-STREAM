import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { CustomerTemp } from "../../entity/Customer_temp";
import { request } from "../../utils/request";
import * as _ from "lodash";
import { exit } from "process";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getSubCustomers(data, token) {
  const result: any = await request({
    method: "post",
    url: "https://bss.myhuaweicloud.com/v2/partners/sub-customers/query",
    headers: {
      "X-Auth-Token": token,
    },
    data,
  }).catch((err) => {
    console.log(err);
  });

  if (result) {
    return {
      customer_infos: result.customer_infos,
      count: result.count,
    };
  }

  // 报错的情况，也要考虑
  return {
    customer_infos: [],
    count: 0,
  };
}
export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("调用华为云接口获取当日直客数据");
    // await AppDataSource.initialize(); // 每一次都得执行

    const iamUsers = await AppDataSource.getRepository(IamUser)
      .createQueryBuilder("iamUsers")
      .where("iamUsers.status = :status", { status: 1 }) // 在用的账号
      .andWhere("iamUsers.sort in (:...sorts)", {
        sorts: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
      })
      .orderBy("iamUsers.sort", "ASC") // 按照排序来，一般重点区域排在前面
      .getMany();

    // 迭代处理所有BP
    for (let i = 0; i < iamUsers.length; i++) {
      const u = iamUsers[i];
      // console.log(u.bpId);
      // 每页1000条
      let limit = 100; // 每页100条
      // 获取总页数
      const { count } = await getSubCustomers(
        {
          offset: 0,
          limit: 1,
        },
        u.token
      );

      // count 可能为undefined 或者 0
      if (!count) {
        // console.log(count);
        continue;
      }

      // 总页数
      let pageCount = Math.ceil(count / limit);
      let records = [];
      for (let i = 0; i < pageCount; i++) {
        const { customer_infos } = await getSubCustomers(
          {
            offset: i * limit,
            limit,
          },
          u.token
        );

        if (!customer_infos) {
          continue;
        }
        _.forEach(customer_infos, (v: any) => {
          v.associated_on = dayjs
            .utc(v.associated_on)
            .local()
            .format("YYYY-MM-DD HH:mm:ss");
          v.parent_id = u.bpId;
          v.bpId = u.bpId; // BP账号的ID
          v.updateTime = v.createTime = dayjs().format("YYYY-MM-DD");
          v.customerType = 0; // 直客类型
        });
        records = records.concat(customer_infos);
      }

      await AppDataSource.createQueryBuilder()
        .insert()
        .into(CustomerTemp)
        .values(records)
        .orUpdate(
          [
            "bpId",
            "parent_id",
            "customer",
            "account_name",
            "associated_on",
            "association_type",
            "label",
            "telephone",
            "verified_status",
            "country_code",
            "customer_type",
            "is_frozen",
            "account_managers",
            "xaccount_id",
            "xaccount_type",
            "customer_level",
            "bind_status",
            "unbind_on",
            "isNA",
            "naRecords",
            "newCustomerStatus",
            "newCustomerRecord",
            "isNewCustomer",
            "updateTime",
          ],
          ["updateTime", "customer_id"]
        )
        .execute();
      // console.log(records.length);
    }
    console.timeEnd("调用华为云接口获取当日直客数据");
    resolve("调用华为云接口获取当日直客数据 done");
    // exit(1);
  });
};
