import { OldAppDataSource, AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { request } from "../../utils/request";
import iamUsers from "../../constant/bpUsersInfo";
import * as _ from "lodash";
import { Customer } from "../../entity/Customer";
import { Partner } from "../../entity/Partner";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

(async () => {
  console.time("导入生产库中精英服务商的数据");
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
    "SELECT * FROM elitecustomers c group by c.indirect_partner_id"
  );

  for (let i = 0; i < allDifCustomers.length; i++) {
    const c = allDifCustomers[i];
    // 按照版本号排序
    let result = await queryRunner.query(
      `select * from elitecustomers c where c.indirect_partner_id = "${c.indirect_partner_id}" order by c.version desc` // *要细化
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

        updateTime: dayjs(v.updatedAt).format("YYYY-MM-DD"),
        createTime: dayjs(v.createdAt).format("YYYY-MM-DD"),
        version: version,
        customerType: 2, // 标记为精服的客户类型
      };

      await queryRunner2.manager.upsert(
        Partner,
        [c],
        ["updateTime", "indirect_partner_id", "version"]
      );
    }
  }
  // 关闭
  await queryRunner.release();
  await queryRunner2.release();

  console.timeEnd("导入生产库中精英服务商的数据");
  exit(1);
})();
