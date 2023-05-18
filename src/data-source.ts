import "reflect-metadata";
import { DataSource } from "typeorm";

import { IamUser } from "./entity/Iam_user";
import { Customer } from "./entity/Customer";
import { CustomerTemp } from "./entity/Customer_temp";
import { Partner } from "./entity/Partner";
import { PartnerTemp } from "./entity/Partner_temp";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

let AppDataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "mc000306",
  database: "hwautodata",
  synchronize: true,
  logging: false,
  entities: [IamUser, Customer, Partner, CustomerTemp, PartnerTemp],
  migrations: [],
  subscribers: [],
});

let OldAppDataSource = new DataSource({
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

if (argv.production) {
  AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "Uz6@ynpMu93@Jc",
    database: "hwautodata",
    synchronize: true,
    logging: false,
    entities: [IamUser, Customer, Partner, CustomerTemp, PartnerTemp],
    migrations: [],
    subscribers: [],
  });

  OldAppDataSource = new DataSource({
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
}

export { AppDataSource, OldAppDataSource };
