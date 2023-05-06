import { AppDataSource } from "./data-source";
import { IamUser } from "./entity/Iam_user";
import { Partner } from "./entity/Partner";
import { request } from "./utils/request";
import * as _ from "lodash";
import { exit } from "process";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getSubCustomers(data, token) {
  const result: any = await request({
    method: "post",
    url: "https://bss.myhuaweicloud.com/v2/partners/indirect-partners/query",
    headers: {
      "X-Auth-Token": token,
    },
    data,
  });

  if (result) {
    return {
      indirect_partners: result.indirect_partners,
      count: result.count,
    };
  }

  // 报错的情况，也要考虑
  return result;
}
(async () => {
  await AppDataSource.initialize(); // 每一次都得执行

  const iamUsers = await AppDataSource.getRepository(IamUser)
    .createQueryBuilder("iamUsers")
    .where("iamUsers.status = :status", { status: 1 }) // 在用的账号
    // .andWhere("iamUsers.bpId = :bpId", {
    //   bpId: "a89f44cd78a348b29c69bc71dd4d6f5e",
    // })
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
      const { indirect_partners } = await getSubCustomers(
        {
          offset: i * limit,
          limit,
        },
        u.token
      );

      if (!indirect_partners) {
        continue;
      }
      _.forEach(indirect_partners, (v: any) => {
        v.associated_on = dayjs
          .utc(v.associated_on)
          .local()
          .format("YYYY-MM-DD HH:mm:ss");
        v.updateTime = dayjs().format("YYYY-MM-DD");
        v.bpId = u.bpId; // BP账号的ID
      });
      records = records.concat(indirect_partners);
    }

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Partner)
      .values(records)
      .orUpdate(
        [
          "bpId",
          "indirect_partner_id",
          "mobile_phone",
          "email",
          "account_name",
          "name",
          "associated_on",
          "account_manager_id",
          "account_manager_name",
          "updateTime",
        ],
        ["updateTime", "indirect_partner_id"]
      )
      .execute();
    // console.log(records.length);
  }
  exit(1);
})();
