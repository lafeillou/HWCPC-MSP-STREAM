import { AppDataSource } from "./data-source";
import { IamUser } from "./entity/Iam_user";
import { request } from "./utils/request";
import iamUsers from "./constant/bpUsersInfo";
import * as _ from "lodash";
import { exit } from "process";

(async () => {
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
        // console.log({
        //   userId: id,
        //   userName: ima_user_name,
        //   sort: sort,
        //   status: canUse,
        //   expiresAt: "",
        //   issuedAt: "",
        //   bpId: domain.id,
        //   token: resHeader["x-subject-token"],
        // });

        const iamUser = await AppDataSource.createQueryBuilder()
          .insert()
          .into(IamUser)
          .values({
            userId: id,
            userName: ima_user_name,
            sort: sort,
            status: canUse,
            expiresAt: "",
            issuedAt: "",
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
        console.log("==========");
        // 处理错误情况
        console.log(error);
      })
      .then(function () {
        // 总是会执行
        // 记录审计信息
      });
  });
})();
