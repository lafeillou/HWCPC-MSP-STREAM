import { AppDataSource } from "../../data-source";
import * as _ from "lodash";
import { Partner } from "../../entity/Partner";
import { PartnerTemp } from "../../entity/Partner_temp";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

(async () => {
  console.time("统一标记最新版本号为当前最新版本");
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库
  await queryRunner.connect();

  // 按照版本号排序
  let result = await queryRunner.query(
    `update partner c set c.isNewest = 1  where c.id in (select id from (select row_number() over (partition by c.indirect_partner_id order by c.version desc ) as rn, c.* from partner as c) as b where b.rn = 1)`
  );

  console.log(result);
  console.timeEnd("统一标记最新版本号为当前最新版本");
  await queryRunner.release();
  exit(1);
})();
