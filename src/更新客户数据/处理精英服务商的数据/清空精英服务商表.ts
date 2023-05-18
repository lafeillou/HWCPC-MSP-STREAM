import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { CustomerTemp } from "../../entity/Customer_temp";
import { Partner } from "../../entity/Partner";

export default () => {
  console.time("清空精英服务商表");
  return new Promise(async (resolve, reject) => {
    await AppDataSource.createQueryBuilder().delete().from(Partner).execute();
    console.timeEnd("清空精英服务商表");
    resolve("清空精英服务商表 done");
  });
};
