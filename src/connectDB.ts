import { AppDataSource } from "./data-source";
import { IamUser } from "./entity/Iam_user";
import { request } from "./utils/request";
import iamUsers from "./constant/bpUsersInfo";
import * as _ from "lodash";
import { exit } from "process";

(async () => {
  await AppDataSource.initialize()
    .then((res) => {
      console.log("==========");
      console.log(res);
      console.log("======initialize end");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    }); // 初始化数据库连接
})();
