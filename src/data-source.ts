import "reflect-metadata";
import { DataSource } from "typeorm";

import { IamUser } from "./entity/Iam_user";
import { Customer } from "./entity/Customer";
import { Partner } from "./entity/Partner";

// 本地数据库
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "mc000306",
  database: "hwautodata",
  synchronize: true,
  logging: false,
  entities: [IamUser, Customer, Partner],
  migrations: [],
  subscribers: [],
});

// 正式生产数据库，需要通过跳板机访问
export const OldAppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3307,
  username: "root",
  password: "Uz6@ynpMu93@Jc",
  database: "iocsysprodonlyapi",
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
