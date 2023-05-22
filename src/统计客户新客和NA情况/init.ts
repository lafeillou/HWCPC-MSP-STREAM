// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
import { AppDataSource, OldAppDataSource } from "../data-source";
import { BaseDataCustomersMonth } from "../entity/customers_month";
import { Customer } from "../entity/Customer";

const dayjs = require("dayjs");
import { exit } from "process";
(async () => {
  // 2023年度前4个月，按月度统计NA和新客的情况

  console.time("统计客户新客和NA情况总耗时");
  // 初始化数据库连接
  await connection();

  const customers = await AppDataSource.getRepository(Customer)
    .createQueryBuilder("c")
    .getMany();

  console.log(customers.length);
  console.timeEnd("统计客户新客和NA情况总耗时");
  // 直客和精服客户相关数据 end
  exit(1);
})();
