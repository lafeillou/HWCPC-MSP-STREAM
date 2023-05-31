// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
import syncStep1 from "./统计直客的新客和NA情况";
import syncStep2 from "./统计精英服务商的客户的新客和NA情况";

import { exit } from "process";
(async () => {
  // 2023年度前4个月，按月度统计NA和新客的情况

  console.time("统计客户新客和NA情况总耗时");
  // 初始化数据库连接
  await connection();

  // const p1 = Promise.all([asyncStep1("init"), asyncStep2("init")]);
  // await p1;
  await syncStep1("init");
  await syncStep2("init");
  console.timeEnd("统计客户新客和NA情况总耗时");
  // 直客和精服客户相关数据 end
  exit(0);
})();
