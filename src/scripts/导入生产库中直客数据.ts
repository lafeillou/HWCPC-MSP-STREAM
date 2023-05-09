import { OldAppDataSource, AppDataSource } from "../data-source";
import { IamUser } from "../entity/Iam_user";
import { request } from "../utils/request";
import iamUsers from "../constant/bpUsersInfo";
import * as _ from "lodash";
import { Customer } from "../entity/Customer";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

(async () => {
  console.time("导入生产库中直客数据");
  await OldAppDataSource.initialize();
  await AppDataSource.initialize();
  // .then(async () => {
  // })
  // .catch((err) => {
  //   console.error("Error during Data Source initialization", err);
  // }); // 初始化数据库连接
  // console.log("连接到生产数据库iocsysprodonlyapi");

  const queryRunner = OldAppDataSource.createQueryRunner(); // 源数据库
  const queryRunner2 = AppDataSource.createQueryRunner(); // 目标数据库

  await queryRunner.connect();
  await queryRunner2.connect();

  // 查询所有不同的客户ID
  const allDifCustomers = await queryRunner.query(
    "SELECT * FROM customers c group by c.customer_id"
  );

  for (let i = 0; i < allDifCustomers.length; i++) {
    const c = allDifCustomers[i];
    // 按照版本号排序
    let result = await queryRunner.query(
      `select * from customers c where c.customer_id = "${c.customer_id}" order by c.version desc` // *要细化
    );

    result = _.uniqWith(result, (arrVal, othVal) => {
      return _.isEqual(
        _.omit(arrVal, ["createdAt", "updatedAt", "version", "id"]),
        _.omit(othVal, ["createdAt", "updatedAt", "version", "id"])
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
        newCustomerStatus: v.smbStatus,
        newCustomerRecord: v.smbRecord,
        isNewCustomer: v.isSMB,
        updateTime: dayjs(v.updatedAt).format("YYYY-MM-DD"),
        createTime: dayjs(v.createdAt).format("YYYY-MM-DD"),
        version: version,
        customerType: 0, // 标记为直客类型
      };

      await queryRunner2.manager.upsert(
        Customer,
        [c],
        ["updateTime", "customer_id", "version"]
      );
    }
  }
  // 关闭
  await queryRunner.release();
  await queryRunner2.release();

  console.timeEnd("导入生产库中直客数据");
  exit(1);
})();
