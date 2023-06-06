import { AppDataSource } from "../../data-source";
import * as _ from "lodash";
import { Customer } from "../../entity/Customer";
import { CustomerTemp } from "../../entity/Customer_temp";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("统一标记最新版本号为当前最新版本");
    // await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库
    await queryRunner.connect();

    // 按照版本号排序
    let result = await queryRunner.query(
      `update base_data_customer c set c.isNewest = 1, c.updateTime = "${dayjs().format(
        "YYYY-MM-DD"
      )}"  where c.id in (select id from (select row_number() over (partition by c.customer_id, c.customerType order by c.version desc ) as rn, c.* from base_data_customer as c) as b where b.rn = 1)`
    );

    // 将不是第一位的 isNewest字段都设置为0
    let result0 = await queryRunner.query(
      `update base_data_customer c set c.isNewest = 0, c.updateTime = "${dayjs().format(
        "YYYY-MM-DD"
      )}" where c.id in (select id from (select row_number() over (partition by c.customer_id, c.customerType order by c.version desc ) as rn, c.* from base_data_customer as c) as b where b.rn = 2)`
    );

    console.log(result);
    console.timeEnd("统一标记最新版本号为当前最新版本");
    await queryRunner.release();
    // exit(1);
    resolve("统一标记最新版本号为当前最新版本 done");
  });
};
