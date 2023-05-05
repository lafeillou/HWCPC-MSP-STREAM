import { AppDataSource } from "./data-source";
import { IamUser } from "./entity/Iam_user";
import { Customer } from "./entity/Customer";
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
    url: "https://bss.myhuaweicloud.com/v2/partners/sub-customers/query",
    headers: {
      "X-Auth-Token": token,
    },
    data,
  });

  if (result) {
    return {
      customer_infos: result.customer_infos,
      count: result.count,
    };
  }

  // 报错的情况，也要考虑
  return result;
}
(async () => {
  await AppDataSource.initialize(); // 每一次都得执行

  const iamUsers = await await AppDataSource.getRepository(IamUser)
    .createQueryBuilder("iamUsers")
    .where("iamUsers.status = :status", { status: 1 }) // 在用的账号
    .orderBy("iamUsers.sort", "ASC") // 按照排序来，一般重点区域排在前面
    .getMany();

  // 迭代bp账号
  for (let i = 0; i < iamUsers.length; i++) {
    // console.log("=====一级经销商");
    const u = iamUsers[i];
    // console.log(u.bpId);

    // 获取某一个bp下所有的精英服务商
    const partners = await AppDataSource.getRepository(Partner)
      .createQueryBuilder("partner")
      .where("partner.bpId = :bpId", { bpId: u.bpId })
      .getMany();

    // 迭代精英服务商
    for (let i = 0; i < partners.length; i++) {
      // console.log("=====二级经销商");
      const p = partners[i];
      // console.log(p.indirect_partner_id);
      // 每页1000条
      let limit = 100; // 每页100条
      // 获取总页数
      const { count } = await getSubCustomers(
        {
          offset: 0,
          limit: 1,
          indirect_partner_id: p.indirect_partner_id,
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
            indirect_partner_id: p.indirect_partner_id,
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
          v.record_time = dayjs.utc().local().format("YYYY-MM-DD");
          v.parent_id = u.bpId;
          v.bpId = u.bpId; // BP账号的ID
        });
        records = records.concat(customer_infos);
      }

      await AppDataSource.createQueryBuilder()
        .insert()
        .into(Customer)
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
            "smbStatus",
            "smbRecord",
            "isSMB",
          ],
          ["record_time", "customer_id"]
        )
        .execute();
      // console.log(records.length);
    }
  }

  exit(1);
})();
