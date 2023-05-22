// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
const dayjs = require("dayjs");
import { exit } from "process";
(async () => {
  const currentMonth = dayjs().month() + 1;
  const currentDay = dayjs().date();

  console.log(currentMonth);
  console.log(currentDay);

  return;
  console.time("统计客户新客和NA情况总耗时");
  // 初始化数据库连接
  await connection();

  console.timeEnd("统计客户新客和NA情况总耗时");
  // 直客和精服客户相关数据 end
  exit(1);
})();
