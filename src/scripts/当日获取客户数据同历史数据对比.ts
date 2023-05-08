import { AppDataSource } from "../data-source";
import * as _ from "lodash";
import { Customer } from "../entity/Customer";
import { CustomerTemp } from "../entity/Customer_temp";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

(async () => {
  console.time("当日获取客户数据同历史数据对比");
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库

  // 查询所有历史客户且版本为最新的
  const historyCustomers = await queryRunner.query(
    "select * from (select row_number() over (partition by c.customer_id order by c.version desc ) as rn, c.* from customer as c) as b where b.rn = 1"
  );

  for (let i = 0; i < 1; i++) {
    const customer = historyCustomers[i];

    const customerPlain = _.omit(customer, [
      "createTime",
      "updateTime",
      "version",
      "id",
      "rn",
    ]);

    // 通过华为接口获取的最新的客户数据
    const matchedCustomer = await AppDataSource.getRepository(CustomerTemp)
      .createQueryBuilder("customerTemp")
      .where("customerTemp.customer_id = :customer_id", {
        customer_id: customer.customer_id,
      })
      .getOne();

    if (matchedCustomer) {
      const matchedCustomerPlain = _.omit(matchedCustomer, [
        "createTime",
        "updateTime",
      ]);

      const isChanged = !_.isEqual(matchedCustomerPlain, customerPlain);

      if (isChanged) {
        // 直接插入
        await AppDataSource.createQueryBuilder()
          .insert()
          .into(Customer)
          .values({
            ...matchedCustomerPlain,
            version: customer.version + 1,
            bind_status: 1,
            unbind_on: null,
            createTime: dayjs().format("YYYY-MM-DD"),
            updateTime: dayjs().format("YYYY-MM-DD"),
          })
          .execute();
      } else {
        // do nothing
      }
      // 没有在最新的客户数据中找到 历史中某个customer_id; 查询的当天客户状态为解绑
    } else {
      if (!customer.unbind_on) {
        const historyCustomer = await AppDataSource.getRepository(Customer)
          .createQueryBuilder("customer")
          .where("customer.id = :id", {
            id: customer.id,
          })
          .getOne();

        historyCustomer.unbind_on = dayjs(customer.updateTime).format(
          "YYYY-MM-DD"
        );
        historyCustomer.bind_status = 0;

        await AppDataSource.createQueryBuilder()
          .update(Customer)
          .set(historyCustomer)
          .where("id = :id", { id: customer.id })
          .execute();
      }
    }
  }

  console.timeEnd("当日获取客户数据同历史数据对比");
  exit(1);
})();
