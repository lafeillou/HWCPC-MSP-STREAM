import { AppDataSource, OldAppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { request } from "../../utils/request";
import iamUsers from "../../constant/bpUsersInfo";
import * as _ from "lodash";
import { exit } from "process";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

export default () => {
  return new Promise(async (resolve, reject) => {
    console.time("初始化数据库连接");
    await AppDataSource.initialize()
      .then(() => {
        if (argv.production) {
          console.log("生产环境cool数据库初始化OK!");
        } else {
          console.log("开发环境cool数据库初始化OK!");
        }
      })
      .catch((err) => {
        if (argv.production) {
          console.error("生产环境cool数据库初始化失败:", err);
        } else {
          console.error("开发环境cool数据库初始化失败:", err);
        }

        reject(err);
      });
    await OldAppDataSource.initialize()
      .then(() => {
        console.log("生产环境iocsysprodonlyapi数据库初始化OK!");
      })
      .catch((err) => {
        console.error("生产环境iocsysprodonlyapi数据库初始化失败:", err);
        reject(err);
      });
    console.timeEnd("初始化数据库连接");
    resolve("初始化数据库连接 done");
  });
};
