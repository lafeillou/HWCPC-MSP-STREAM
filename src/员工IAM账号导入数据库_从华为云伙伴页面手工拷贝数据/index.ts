// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
import { OldAppDataSource, AppDataSource } from "../data-source";
import * as _ from "lodash";

// import syncStep1 from "./遍历客户表";
// import syncStep2 from "./遍历精服";

const dayjs = require("dayjs");
const XLSX = require("xlsx-extract").XLSX;

import { exit } from "process";
(async () => {
  console.time("员工IAM账号导入数据库_从华为云伙伴页面手工拷贝数据");
  // 初始化数据库连接
  await connection();

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();

  let rowIndex = 0;
  // 表头
  const headerMap = {};

  new XLSX()
    .extract(__dirname + "/渠道-IAM_6_26.xlsx", { sheet_id: 1 }) // or sheet_name or sheet_nr
    // .on('sheet', (sheet) => {
    //   console.log('sheet', sheet); //sheet is array [sheetname, sheetid, sheetnr]
    // })
    .on("row", async (row) => {
      if (rowIndex === 0) {
        _.forEach(row, (o, i) => {
          headerMap[o] = i;
        });
      } else {
        // console.log(row);
        if (!row[headerMap["bpName"]]) {
          return;
        }
        const record: any = {};
        record.bpName = _.trim(row[headerMap["bpName"]]);
        // record.workerId = null;
        // record.area = row[headerMap["区域"]];
        record.name = _.trim(row[headerMap["name"]]);
        record.iamAccount = _.trim(row[headerMap["iamAccount"]]);

        // if (
        //   row[headerMap["角色状态"]] === "正常" &&
        //   row[headerMap["人员状态"]] === "在职"
        // ) {
        // console.log(record);
        // 将数据插入数据库
        await queryRunner
          .query(
            `insert into iamaccounts (bpName,workerId,name,iamAccount,createdAt,updatedAt) values('${
              record.bpName
            }', '${record.workerId}',  '${record.name}', '${
              record.iamAccount
            }','${dayjs().format("YYYY-MM-DD HH:mm:ss")}', '${dayjs().format(
              "YYYY-MM-DD HH:mm:ss"
            )}' )`
          )
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {});
        // }
      }
      rowIndex++;
    })
    // .on('cell', (cell) => {
    //   console.log('cell', cell); //cell is a value or null
    // })
    .on("error", (err) => {
      console.error("error", err);
    })
    .on("end", () => {
      setTimeout(async () => {
        // console.log("end");
        await queryRunner.release();
        console.timeEnd("员工IAM账号导入数据库_从华为云伙伴页面手工拷贝数据");
        exit(0);
      }, 5000);
    });

  // 直客和精服客户相关数据 end
})();
