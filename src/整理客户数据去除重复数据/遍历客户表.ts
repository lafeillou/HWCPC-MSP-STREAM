import { AppDataSource } from "../data-source";
import * as _ from "lodash";
import { CustomerSwap } from "../entity/customer_swap";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("遍历客户表");

    const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库
    await queryRunner.connect();

    // 找出所有不重复的直客、精英服务商的客户
    let allDifCustomers = await queryRunner.query(
      `select distinct c.customer_id from base_data_customer c`
    );

    for (let i = 0; i < allDifCustomers.length; i++) {
      const c = allDifCustomers[i];

      let result = await queryRunner.query(
        `select * from base_data_customer c where c.customer_id = "${c.customer_id}" order by c.version desc` // *要细化
      );

      result = _.uniqWith(result, (arrVal, othVal) => {
        return _.isEqual(
          _.omit(arrVal, [
            "createTime",
            "updateTime",
            "version",
            "id",
            "isNewest",
          ]),
          _.omit(othVal, [
            "createTime",
            "updateTime",
            "version",
            "id",
            "isNewest",
          ])
        );
      });

      // 写入数据库
      for (let i = 0; i < result.length; i++) {
        const v = result[i];
        const version = result.length - i;

        const c = {
          bpId: v.bpId,
          parent_id: v.bpId,
          customer: v.customer,
          customer_id: v.customer_id,
          account_name: v.account_name,
          associated_on: dayjs
            .utc(v.associated_on)
            .local()
            .format("YYYY-MM-DD HH:mm:ss"), // to do
          association_type: v.association_type,
          label: v.label,
          telephone: v.telephone,
          verified_status: v.verified_status,
          country_code: v.country_code,
          customer_type: v.customer_type,
          is_frozen: v.is_frozen,
          account_managers: v.account_managers,
          xaccount_id: v.xaccount_id,
          xaccount_type: v.xaccount_type,
          customer_level: v.customer_level,
          bind_status: v.bind_status,
          unbind_on: v.unbind_on,
          isNA: v.isNA,
          naRecords: v.naRecords,
          newCustomerStatus: v.newCustomerStatus,
          newCustomerRecord: v.newCustomerRecord,
          isNewCustomer: v.isNewCustomer,
          updateTime: dayjs(v.updateTime).format("YYYY-MM-DD"),
          createTime: dayjs(v.createTime).format("YYYY-MM-DD"),
          version: version,
          customerType: v.customerType, // 标记为直客类型
          isNewest: i === 0 ? 1 : 0,
        };

        await queryRunner.manager.upsert(
          CustomerSwap,
          [c],
          ["updateTime", "customer_id", "version"]
        );
      }
    }

    //  关闭
    await queryRunner.release();

    console.timeEnd("遍历客户表");

    resolve("遍历客户表 done");
  });
};
