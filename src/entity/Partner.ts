import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  VersionColumn,
} from "typeorm";

@Entity()
@Unique(["record_time", "indirect_partner_id"])
export class Partner {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Index()
  @CreateDateColumn({ comment: "创建时间" })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: "更新时间" })
  updateTime: Date;

  @Index()
  @VersionColumn()
  version: number;

  @Index()
  @Column({
    type: "varchar",
    length: 255,
    comment: "所属Bp",
    nullable: true,
  })
  bpId: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "云经销商ID",
    nullable: true,
  })
  indirect_partner_id: string;

  @Column({
    type: "varchar",
    length: 20,
    comment: "云经销商的手机号码",
    nullable: true,
  })
  mobile_phone: string;

  @Column({
    type: "varchar",
    length: 200,
    comment: "云经销商的邮箱",
    nullable: true,
  })
  email: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "云经销商的账户名",
    nullable: true,
  })
  account_name: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "云经销商的名称",
    nullable: true,
  })
  name: string;

  @Column({
    type: "date",
    comment:
      "云经销商关联华为云总经销商的时间。UTC时间（包括时区），例如2016-03-28T00:00:00Z。",
    nullable: true,
  })
  associated_on: Date;

  @Column({
    type: "varchar",
    length: 64,
    comment: "客户经理登录账户名",
    nullable: true,
  })
  account_manager_id: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "客户经理的名称",
    nullable: true,
  })
  account_manager_name: string;

  @Column({
    type: "date",
    comment: "查询时间",
    nullable: true,
  })
  record_time: Date;
}
