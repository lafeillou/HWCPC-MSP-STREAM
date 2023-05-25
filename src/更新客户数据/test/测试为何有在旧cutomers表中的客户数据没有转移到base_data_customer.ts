// 从无到有，初始化流程的时候使用的脚本
import connection from "../../connection/db";

import asyncStep13 from "../处理直客和精服客户的数据/清空客户表";
import asyncStep14 from "../处理直客和精服客户的数据/清空客户暂存表";
import asyncStep15 from "../处理精英服务商的数据/清空精英服务商表";
import asyncStep16 from "../处理精英服务商的数据/清空精英服务商暂存表";

import syncStep5 from "../处理直客和精服客户的数据/导入生产库中直客数据";

(async () => {
  console.time(
    "测试为何有在旧cutomers表中的客户数据没有转移到base_data_customer"
  );
  // 初始化数据库连接
  await connection();

  // 清空客户表、客户暂存表、精服表、精服暂存表
  const p5 = Promise.all([
    asyncStep13(),
    asyncStep14(),
    asyncStep15(),
    asyncStep16(),
  ]).then(([res1, res2, res3, res4]) => {
    // console.log(res1);
    // console.log(res2);
  });
  await p5;

  await syncStep5();

  console.timeEnd(
    "测试为何有在旧cutomers表中的客户数据没有转移到base_data_customer"
  );
})();
