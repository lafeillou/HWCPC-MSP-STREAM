import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { CustomerTemp } from "../../entity/Customer_temp";
import { PartnerTemp } from "../../entity/Partner_temp";

export default () => {
  console.time("清空精英服务商暂存表");
  return new Promise(async (resolve, reject) => {
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(PartnerTemp)
      .execute();
    console.timeEnd("清空精英服务商暂存表");
    resolve("清空精英服务商暂存表 done");
  });
};
