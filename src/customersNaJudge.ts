// 判断直客、精服的客户是否为NA
import { AppDataSource } from "./data-source";
import { IamUser } from "./entity/Iam_user";
import { CustomerTemp } from "./entity/Customer_temp";
import { request } from "./utils/request";
import * as _ from "lodash";
import { exit } from "process";

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

(async () => {
  await AppDataSource.initialize(); // 每一次都得执行

  // 获取某一个bp下所有的精英服务商
  const customers = await AppDataSource.getRepository(CustomerTemp)
    .createQueryBuilder("customer_temp")
    .getMany();
  console.log(customers.length);
})();
