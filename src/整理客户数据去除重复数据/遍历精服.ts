import { AppDataSource } from "../data-source";
import * as _ from "lodash";
import { PartnerSwap } from "../entity/Partner_swap";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("遍历精服表");

    const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库
    await queryRunner.connect();

    // 找出所有不重复的直客、精英服务商的客户
    let allDifCustomers = await queryRunner.query(
      `select distinct c.indirect_partner_id from base_data_elite_customer c`
    );

    for (let i = 0; i < allDifCustomers.length; i++) {
      const c = allDifCustomers[i];

      let result = await queryRunner.query(
        `select * from base_data_elite_customer c where c.indirect_partner_id = "${c.indirect_partner_id}" order by c.version desc` // *要细化
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
          indirect_partner_id: v.indirect_partner_id,
          mobile_phone: v.mobile_phone,
          email: v.email,
          account_name: v.account_name,
          name: v.name,
          associated_on: dayjs
            .utc(v.associated_on)
            .local()
            .format("YYYY-MM-DD HH:mm:ss"), // to do
          account_manager_id: v.account_manager_id,
          account_manager_name: v.account_manager_name,
          bind_status: v.bind_status,
          unbind_on: v.unbind_on,
          updateTime: dayjs(v.updateTime).format("YYYY-MM-DD"),
          createTime: dayjs(v.createTime).format("YYYY-MM-DD"),
          version: version,
          customerType: v.customerType, // 标记为直客类型
          isNewest: i === 0 ? 1 : 0,
        };

        await queryRunner.manager.upsert(
          PartnerSwap,
          [c],
          ["updateTime", "indirect_partner_id", "version"]
        );
      }
    }

    //  关闭
    await queryRunner.release();

    console.timeEnd("遍历精服表");

    resolve("遍历精服表 done");
  });
};
