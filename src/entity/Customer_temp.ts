import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity()
@Unique(["updateTime", "customer_id"])
export class CustomerTemp {
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
    type: "varchar",
    length: 255,
    comment: "所属Bp",
    nullable: true,
  })
  bpId: string;

  @Index()
  @Column({
    type: "varchar",
    length: 128,
    comment: "客户名称",
    nullable: true,
  })
  customer: string;

  @Index()
  @Column({
    type: "varchar",
    length: 128,
    comment: "客户账户",
    nullable: true,
  })
  account_name: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "客户ID",
    nullable: true,
  })
  customer_id: string;

  @Column({
    type: "date",
    comment: "关联日期 UTC时间 也就是比北京时间早8个小时",
    nullable: true,
  })
  associated_on: Date;

  @Column({
    type: "tinyint",
    comment: "关联类型 1：顾问销售 2：代售",
    nullable: true,
  })
  association_type: number;

  @Column({
    type: "varchar",
    length: 64,
    comment: "客户标签",
    nullable: true,
  })
  label: string;

  @Column({
    type: "varchar",
    length: 20,
    comment: "手机号",
    nullable: true,
  })
  telephone: string;

  @Column({
    type: "tinyint",
    comment:
      "认证状态 -1：未实名认证 0：实名认证审核中 1：实名认证不通过 2：已实名认证",
    nullable: true,
  })
  verified_status: number;

  @Column({
    type: "varchar",
    length: 10,
    comment: "国家码，电话号码的国家码前缀。例如：中国 0086。",
    nullable: true,
  })
  country_code: string;

  @Column({
    type: "tinyint",
    comment: "客户类型：-1：无类型 0：个人 1：企业",
    nullable: true,
  })
  customer_type: string;

  @Column({
    type: "tinyint",
    comment: "是否冻结：0：否 1：客户账号冻结 2：客户账号和资源冻结",
    nullable: true,
  })
  is_frozen: number;

  @Column({
    type: "json",
    comment: "该客户对应的客户经理信息，目前只支持1个",
    nullable: true,
  })
  account_managers: object;

  @Column({
    type: "varchar",
    length: 128,
    comment: "伙伴销售平台的用户唯一标识，该标识的具体值由伙伴分配。",
    nullable: true,
  })
  xaccount_id: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "华为分配给合作伙伴的平台标识。",
    nullable: true,
  })
  xaccount_type: string;

  @Column({
    type: "varchar",
    length: 64,
    comment: "客户等级 V0 V1 V2 V3 V4 V5",
    nullable: true,
  })
  customer_level: string;

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
    type: "tinyint",
    comment: "是否NA 0 否  1 是",
    default: 0,
    nullable: true,
  })
  isNA: number;

  @Column({
    type: "json",
    comment: "是否NA 获取接口原始信息",
    nullable: true,
  })
  naRecords: object;

  @Column({
    type: "varchar",
    length: 50,
    default: "N",
    comment: "Y,N,U(UNDETERMINED),Y_UNDETERMINED 接口原始记录",
    nullable: true,
  })
  newCustomerStatus: string;

  @Column({
    type: "json",
    comment: "是否SMB 获取接口原始信息",
    nullable: true,
  })
  newCustomerRecord: object;

  @Column({
    type: "tinyint",
    comment: "是否SMB 0否 1是",
    default: 0,
    nullable: true,
  })
  isNewCustomer: number;

  @Column({
    type: "varchar",
    length: 64,
    comment:
      "上级经销商ID，直客就是bpId,精英服务商的客户的上级，就是精英服务商ID",
    nullable: true,
  })
  parent_id: string;
}
