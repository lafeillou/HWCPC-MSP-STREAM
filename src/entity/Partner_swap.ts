import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
// 同Partner实体完全一样
@Entity("base_data_elite_customer_swap")
@Unique(["updateTime", "indirect_partner_id", "version", "customerType"])
export class PartnerSwap {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Index()
  @CreateDateColumn({ comment: "创建时间" })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: "更新时间" })
  updateTime: Date;

  @Index()
  @Column({
    type: "int",
  })
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
    type: "tinyint",
    comment: "绑定状态 0 解绑  1 绑定",
    default: 1,
    nullable: true,
  })
  bind_status: number;

  @Column({
    type: "date",
    comment: "解绑时间",
    nullable: true,
  })
  unbind_on: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "上级经销商ID，直客就是bpId,精英服务商的上级，就是bpId,是重复字段",
    nullable: true,
  })
  parent_id: string;

  @Column({
    type: "tinyint",
    comment: "0 直客 1 精英服务商客户 2精英服务商的客户",
    default: 2,
  })
  customerType: number;

  @Column({
    type: "tinyint",
    comment: "1 最新采用版本 0 非最新",
    default: 0,
  })
  isNewest: number;
}
