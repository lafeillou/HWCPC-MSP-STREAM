import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { Customer } from "../../entity/Customer";
import { Partner } from "../../entity/Partner";

export default () => {
  console.time("清空客户表");
  return new Promise(async (resolve, reject) => {
    await AppDataSource.createQueryBuilder().delete().from(Customer).execute();
    console.timeEnd("清空客户表");
    resolve("清空客户表 done");
  });
};
