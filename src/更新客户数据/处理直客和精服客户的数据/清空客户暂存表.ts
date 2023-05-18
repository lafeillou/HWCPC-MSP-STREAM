import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { CustomerTemp } from "../../entity/Customer_temp";
import { Partner } from "../../entity/Partner";

export default () => {
  console.time("清空客户暂存表");
  return new Promise(async (resolve, reject) => {
    await AppDataSource.createQueryBuilder()
      .delete()
      .from(CustomerTemp)
      .execute();
    console.timeEnd("清空客户暂存表");
    resolve("清空客户暂存表 done");
  });
};
