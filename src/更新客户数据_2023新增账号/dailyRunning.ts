// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
// 登录IAM看板账号
import loginIamAccount from "./登录IAM看板账号/iamUsers";
// 导入生产库中精英服务商的数据
// import syncStep2 from "./处理精英服务商的数据/调用华为云接口获取当日精服的数据";
// import syncStep3 from "./处理精英服务商的数据/当日获取精服数据同历史数据对比";
// import syncStep4 from "./处理精英服务商的数据/统一标记最新版本号为当前最新版本";

import syncStep7 from "./处理直客和精服客户的数据/调用华为云接口获取当日直客数据";
// import asyncStep8 from "./处理直客和精服客户的数据/调用华为云接口获取当日精英服务商的客户的数据";

import asyncStep9 from "./处理直客和精服客户的数据/调用华为云接口获取客户是否为NA数据";
import asyncStep10 from "./处理直客和精服客户的数据/调用华为云接口获取客户是否为新客数据";

import syncStep11 from "./处理直客和精服客户的数据/当日获取客户数据同历史数据对比";
import syncStep12 from "./处理直客和精服客户的数据/统一标记最新版本号为当前最新版本";

// import asyncStep14 from "./处理直客和精服客户的数据/清空客户暂存表";

// import asyncStep16 from "./处理精英服务商的数据/清空精英服务商暂存表";

// import { exit } from "process";

export default async () => {
  console.time("更新客户数据_2023新增账号下的直客总耗时");
  // 初始化数据库连接
  // await connection();

  // 登录IAM看板账号
  await loginIamAccount().then((res) => {
    // console.log(res);
  });

  // 清空客户表、客户暂存表、精服表、精服暂存表
  // const p5 = Promise.all([asyncStep14(), asyncStep16()]).then(
  //   ([res1, res2]) => {
  //     // console.log(res1);
  //     // console.log(res2);
  //   }
  // );
  // await p5;
  // 2023年新建的这批账号，只查直客数据
  // 精英服务商的相关数据 start
  // await syncStep2();
  // await syncStep3();
  // await syncStep4();
  // 精英服务商的相关数据 end

  // 直客和精服客户相关数据 start
  // const p3 = Promise.all([asyncStep7(), asyncStep8()]).then(([res1, res2]) => {
  //   // console.log(res1);
  //   // console.log(res2);
  // });
  // await p3;
  await syncStep7();

  const p4 = Promise.all([asyncStep9(), asyncStep10()]).then(([res1, res2]) => {
    // console.log(res1);
    // console.log(res2);
  });
  await p4;

  await syncStep11();
  await syncStep12();
  console.timeEnd("更新客户数据_2023新增账号下的直客总耗时");
};
