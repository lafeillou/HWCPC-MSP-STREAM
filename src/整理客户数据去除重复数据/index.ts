// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";

import syncStep1 from "./遍历客户表";
import syncStep2 from "./遍历精服";

const dayjs = require("dayjs");
import { exit } from "process";
(async () => {
  console.time("整理客户数据去除重复数据");
  // 初始化数据库连接
  await connection();

  // await syncStep1();
  await syncStep2();

  console.timeEnd("整理客户数据去除重复数据");
  // 直客和精服客户相关数据 end
  exit(0);
})();
