// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
const dayjs = require("dayjs");
import { exit } from "process";
import * as _ from "lodash";

import syncStep1 from "./统计直客的新客和NA情况";
import syncStep2 from "./统计精英服务商的客户的新客和NA情况";

const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

(async () => {
  const currentMonth = dayjs().month() + 1;
  const currentDay = dayjs().date();
  const currentYear = dayjs().year();

  // 每个月1日运行一次；其实每天都在运行
  if (currentDay !== 1) {
    console.log(
      `统计客户新客和NA情况只在每月的1日统计，今天是${currentYear}-${currentMonth}-${currentDay}`
    );
    exit(0); // 退出
  }
  console.time("统计客户新客和NA情况总耗时");
  // 初始化数据库连接
  await connection();
  // const p1 = Promise.all([asyncStep1(), asyncStep2()]);
  // await p1;
  await syncStep1();
  await syncStep2();

  console.timeEnd("统计客户新客和NA情况总耗时");
  // 直客和精服客户相关数据 end
  exit(0);
})();
