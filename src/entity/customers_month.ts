import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

/**
 * 工作簿表中可以维护的基础数据表格之一
 * 月度客户
 */
@Entity("base_data_customers_month")
@Unique(["客户ID", "客户类型", "月度"])
export class BaseDataCustomersMonth {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @CreateDateColumn({ comment: "创建时间" })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: "更新时间" })
  updateTime: Date;

  @Index()
  @Column({
    type: "varchar",
    length: 255,
    comment: "客户ID",
    nullable: true,
  })
  客户ID: string;

  @Index()
  @Column({
    type: "varchar",
    length: 255,
    comment: "客户账号",
    nullable: true,
  })
  客户账号: string;

  @Index()
  @Column({
    type: "varchar",
    length: 255,
    comment: "客户名称",
    nullable: true,
  })
  客户名称: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "bpId",
    nullable: true,
  })
  bpId: string;

  @Column({
    type: "json",
    comment: "客户经理",
    nullable: true,
  })
  account_managers: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "关联类型",
    nullable: true,
  })
  关联类型: string;

  @Column({
    type: "date",
    comment: "关联时间",
    nullable: true,
  })
  关联时间: Date;

  @Column({
    type: "tinyint",
    comment: "绑定状态",
    nullable: true,
  })
  绑定状态: number;

  @Column({
    type: "date",
    comment: "解绑时间",
    nullable: true,
  })
  解绑时间: Date;

  @Column({
    type: "tinyint",
    comment: "实名认证状态",
    nullable: true,
  })
  实名认证状态: number;

  @Column({
    type: "varchar",
    length: 100,
    comment: "客户等级",
    nullable: true,
  })
  客户等级: string;

  @Column({
    type: "json",
    comment: "NA状态",
    nullable: true,
  })
  NA状态: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "新客状态",
    nullable: true,
  })
  新客状态: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "二级经销商账号名",
    nullable: true,
  })
  二级经销商账号名: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "二级经销商ID",
    nullable: true,
  })
  二级经销商ID: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "二级经销商名称",
    nullable: true,
  })
  二级经销商名称: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "客户类型",
    nullable: true,
  })
  客户类型: string;

  @Column({
    type: "tinyint",
    comment: "月度",
    nullable: true,
  })
  月度: number;

  @Column({
    type: "tinytext",
    comment: "备注",
    nullable: true,
  })
  备注: string;
}
