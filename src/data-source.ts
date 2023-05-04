import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { IamUser } from "./entity/Iam_user";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "mc000306",
  database: "hwautodata",
  synchronize: true,
  logging: false,
  entities: [IamUser],
  migrations: [],
  subscribers: [],
});
