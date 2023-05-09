import { AppDataSource } from "../../data-source";
import { IamUser } from "../../entity/Iam_user";
import { request } from "../../utils/request";
import iamUsers from "../../constant/bpUsersInfo";
import * as _ from "lodash";
import { exit } from "process";
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

(async () => {
  console.time("登录所有可用的看板华为云IAM账号");
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  // return;
  // 发起请求
  _.forEach(iamUsers, (v, k) => {
    const { account_name, ima_user_name, ima_user_pwd, canUse, sort } = v;
    request({
      method: "post",
      url: "https://iam.myhuaweicloud.com/v3/auth/tokens",
      data: {
        auth: {
          identity: {
            methods: ["password"],
            password: {
              user: {
                domain: {
                  name: account_name,
                },
                name: ima_user_name,
                password: ima_user_pwd,
              },
            },
          },
          scope: {
            domain: {
              name: account_name,
            },
          },
        },
      },
    })
      .then(async (response: any) => {
        // 处理成功情况
        const {
          token: {
            user: { name, id },
            domain,
            expires_at,
            issued_at,
          },
          resHeader,
        } = response;

        const iamUser = await AppDataSource.createQueryBuilder()
          .insert()
          .into(IamUser)
          .values({
            userId: id,
            userName: ima_user_name,
            sort: sort,
            status: canUse,
            expiresAt: dayjs
              .utc(expires_at)
              .local()
              .format("YYYY-MM-DD HH:mm:ss"),
            issuedAt: dayjs
              .utc(issued_at)
              .local()
              .format("YYYY-MM-DD HH:mm:ss"),
            bpId: domain.id,
            token: resHeader["x-subject-token"],
          })
          .orUpdate(
            [
              "userId",
              "userName",
              "sort",
              "status",
              "expiresAt",
              "issuedAt",
              "token",
            ],
            ["bpId"]
          )
          .execute();
      })
      .catch(function (error) {
        // 处理错误情况
        console.log(error);
      })
      .then(function () {
        // 总是会执行
        // 记录审计信息
        if (k === iamUsers.length - 1) {
          console.timeEnd("登录所有可用的看板华为云IAM账号");
          exit(1); // 最后一个bp处理完
        }
      });
  });
})();
