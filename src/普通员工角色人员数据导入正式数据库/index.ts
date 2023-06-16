// 从无到有，初始化流程的时候使用的脚本
import connection from "../connection/db";
import { OldAppDataSource, AppDataSource } from "../data-source";

// import syncStep1 from "./遍历客户表";
// import syncStep2 from "./遍历精服";

const dayjs = require("dayjs");
import { exit } from "process";
(async () => {
  console.time("普通员工角色人员数据导入正式数据库");
  // 初始化数据库连接
  await connection();

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();

  // await syncStep1();
  //await syncStep2();
  // 读取基础数据-员工数据

  // 查询所有不同的客户ID
  const staffs = await queryRunner.query("SELECT * FROM base_data_staff c");

  for (let i = 0; i < staffs.length; i++) {
    // console.log(staffs[i]);
    const { 工号, 姓名, 当前状态, 邮箱, 省份 } = staffs[i];
    const deptName = 省份.replace("华为云", "");
    // console.log(deptName);

    // 查询省份对应的id
    const dept = await queryRunner
      .query(
        `select * from base_sys_department c where c.name = '${deptName}区域'`
      )
      .catch((err) => {
        console.log(err);
      });
    // console.log(dept);
    if (dept && dept[0]) {
      // 当前在职
      if (当前状态 === 1) {
        // 将数据插入数据库
        await queryRunner
          .query(
            `insert into base_sys_user (departmentId, name,username,password,passwordV,nickName,email,status )  values(${
              dept[0].id
            }, '${姓名}', '${邮箱.replace(
              "@isoftstone.com",
              ""
            )}', 'e10adc3949ba59abbe56e057f20f883e', 1, '${姓名}', '${邮箱}',1)`
          )
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
  await queryRunner.release();

  console.timeEnd("普通员工角色人员数据导入正式数据库");
  // 直客和精服客户相关数据 end
  exit(0);
})();
