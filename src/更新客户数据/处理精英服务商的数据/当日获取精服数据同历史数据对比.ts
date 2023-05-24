import { AppDataSource } from "../../data-source";
import * as _ from "lodash";
import { Partner } from "../../entity/Partner";
import { PartnerTemp } from "../../entity/Partner_temp";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { exit } from "process";

async function upsert(matchedPartnerPlain, version) {
  // 直接插入
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Partner)
    .values({
      ...matchedPartnerPlain,
      version,
      isNewest: 1, // 指定为最新的版本
      bind_status: 1,
      unbind_on: null,
      createTime: dayjs().format("YYYY-MM-DD"),
      updateTime: dayjs().format("YYYY-MM-DD"),
    })
    .orUpdate(
      [
        "bpId",
        "parent_id",
        "mobile_phone",
        "email",
        "account_name",
        "name",
        "associated_on", // to do
        "account_manager_id",
        "account_manager_name",
        "bind_status",
        "unbind_on",
        "updateTime",
        "customerType",
      ],
      ["updateTime", "indirect_partner_id", "version"]
    )
    .execute();
}

export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("当日获取精服数据同历史数据对比");
    // await AppDataSource.initialize();

    const queryRunner = AppDataSource.createQueryRunner(); // 目标数据库

    // 新增加的客户入库
    const currentPartners = await AppDataSource.getRepository(PartnerTemp)
      .createQueryBuilder("partnerTemp")
      .getMany();

    for (let i = 0; i < currentPartners.length; i++) {
      const currentPartner = currentPartners[i];
      const matchedOne = await AppDataSource.getRepository(Partner)
        .createQueryBuilder("partner")
        .where("partner.indirect_partner_id = :indirect_partner_id", {
          indirect_partner_id: currentPartner.indirect_partner_id,
        })
        .getOne();

      // 如果不存在，即视为新增
      if (!matchedOne) {
        const currentPartnerPlain = _.omit(currentPartner, [
          "createTime",
          "updateTime",
          "id",
        ]);
        await upsert(currentPartnerPlain, 1);
      }
    }

    // 查询所有历史客户且版本为最新的
    const historyPartners = await queryRunner.query(
      "select * from (select row_number() over (partition by c.indirect_partner_id order by c.version desc ) as rn, c.* from base_data_elite_customer as c) as b where b.rn = 1"
    );

    for (let i = 0; i < historyPartners.length; i++) {
      const partner = historyPartners[i];
      partner.associated_on = dayjs
        .utc(partner.associated_on)
        .local()
        .format("YYYY-MM-DD"); // to do
      const partnerPlain = _.omit(partner, [
        "createTime",
        "updateTime",
        "version",
        "isNewest",
        "id",
        "rn",
      ]);

      // 通过华为接口获取的最新的客户数据
      const matchedPartner = await AppDataSource.getRepository(PartnerTemp)
        .createQueryBuilder("partnerTemp")
        .where("partnerTemp.indirect_partner_id = :indirect_partner_id", {
          indirect_partner_id: partner.indirect_partner_id,
        })
        .getOne();

      if (matchedPartner) {
        const matchedPartnerPlain = _.omit(matchedPartner, [
          "createTime",
          "updateTime",
          "id",
        ]);

        const isChanged = !_.isEqual(matchedPartnerPlain, partnerPlain);

        if (isChanged) {
          await upsert(matchedPartnerPlain, partner.version + 1);
        } else {
          // do nothing
        }
        // 没有在最新的客户数据中找到 历史中某个customer_id; 查询的当天客户状态为解绑
      } else {
        if (!partner.unbind_on) {
          const historyPartner = await AppDataSource.getRepository(Partner)
            .createQueryBuilder("partner")
            .where("partner.id = :id", {
              id: partner.id,
            })
            .getOne();
          historyPartner.updateTime = historyPartner.unbind_on =
            dayjs().format("YYYY-MM-DD");
          historyPartner.bind_status = 0;
          historyPartner.isNewest = 1; // 指定为最新的版本
          await AppDataSource.createQueryBuilder()
            .update(Partner)
            .set(historyPartner)
            .where("id = :id", { id: partner.id })
            .execute();
        }
      }
    }

    console.timeEnd("当日获取精服数据同历史数据对比");
    resolve("当日获取精服数据同历史数据对比 done");
    // exit(1);
  });
};
