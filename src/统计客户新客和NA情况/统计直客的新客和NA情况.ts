// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
import { Customer } from "../entity/Customer";
import { CustomerMonth } from "../entity/Customers_month";

import { AppDataSource } from "../data-source";
const dayjs = require("dayjs");
import { exit } from "process";
import * as _ from "lodash";
import { NamingStrategyNotFoundError } from "typeorm";
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);
function getNewStatus(newCustomerRecord, y, m) {
  if (newCustomerRecord) {
    return newCustomerRecord.new_customer_tag === "Y" ? 1 : 0;
  }
  return null;
}
function getNaStatus(naRecords, y, m) {
  const d = dayjs(
    `${y}-${dayjs()
      .month(m - 1)
      .format("MM")}-01`
  ); // 每个月的1号

  // 每个月的1日会被传进来

  if (naRecords) {
    let result = null;
    for (let i = 0; i < naRecords.length; i++) {
      const na = naRecords[i];
      const r = d.isBetween(
        na.start_date ? dayjs(na.start_date) : dayjs(),
        dayjs(na.end_date),
        null,
        "[]"
      );
      if (r) {
        result = na.na_tag;

        break;
      } else {
        console.log(r);
        console.log(naRecords[i]);
      }
    }
    return result === "Y" ? 1 : 0;
  }

  return null;
}

export default (flag?: any) => {
  return new Promise(async (resolve, reject) => {
    const currentMonth = dayjs().month() + 1;
    const currentDay = dayjs().date();
    const currentYear = dayjs().year();

    console.time("统计直客的新客和NA情况");
    // 初始化数据库连接
    // await connection();

    const customers = await AppDataSource.getRepository(Customer)
      .createQueryBuilder("customer")
      .where("customer.customerType = :customerType", { customerType: 0 }) // 类型为直客
      .orderBy("customer.associated_on", "ASC") // 按照排序来，一般重点区域排在前面
      .getMany();

    // 从一月份开始 一直到 当前月份
    for (let m = flag === "init" ? 1 : currentMonth; m <= currentMonth; m++) {
      // 在计算二月份的时候，更新一月份的结果
      for (let i = 0; i < customers.length; i++) {
        const c = customers[i];

        const temp = {
          客户ID: c.customer_id,
          客户账号: c.account_name,
          客户名称: c.customer,
          bpId: c.bpId,
          account_managers: c.account_managers,
          关联类型: c.association_type,
          关联时间: c.associated_on,
          绑定状态: c.bind_status,
          解绑时间: c.unbind_on,
          实名认证状态: c.verified_status,
          客户等级: c.customer_level,
          NA状态: getNaStatus(c.naRecords, currentYear, m),
          新客状态: getNewStatus(c.newCustomerRecord, currentYear, m),
          二级经销商账号名: null,
          二级经销商ID: null,
          二级经销商名称: null,
          客户类型: "直客",
          月度: m,
          备注: null,
        };

        // 将temp存入数据库
        // 存一次 m 月的
        // 异步写入数据库
        await AppDataSource.createQueryBuilder()
          .insert()
          .into(CustomerMonth)
          .values(temp)
          .orUpdate(
            [
              "id",
              "客户账号",
              "客户名称",
              "bpId",
              "account_managers",
              "关联类型",
              "关联时间",
              "绑定状态",
              "解绑时间",
              "实名认证状态",
              "客户等级",
              "NA状态",
              "新客状态",
              "二级经销商账号名",
              "二级经销商ID",
              "二级经销商名称",
              "备注",
            ],
            ["客户ID", "客户类型", "月度"]
          )
          .execute();
        // 存一次 m - 1月的
        if (m - 1 > 0) {
          await AppDataSource.createQueryBuilder()
            .insert()
            .into(CustomerMonth)
            .values({
              ...temp,
              月度: m - 1,
            })
            .orUpdate(
              [
                "id",
                "客户账号",
                "客户名称",
                "bpId",
                "account_managers",
                "关联类型",
                "关联时间",
                "绑定状态",
                "解绑时间",
                "实名认证状态",
                "客户等级",
                "NA状态",
                "新客状态",
                "二级经销商账号名",
                "二级经销商ID",
                "二级经销商名称",
                "备注",
              ],
              ["客户ID", "客户类型", "月度"]
            )
            .execute();
        }
      }
    }

    // 迭代处理所有直客

    console.timeEnd("统计直客的新客和NA情况");
    resolve("统计直客的新客和NA情况 done");
  });
};
