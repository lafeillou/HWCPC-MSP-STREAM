import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

@Entity("base_data_iam_user")
@Unique(["bpId"])
export class IamUser {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Index()
  @CreateDateColumn({ comment: "创建时间" })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: "更新时间" })
  updateTime: Date;

  @Column({
    type: "varchar",
    length: 255,
    comment: "华为后台用户的id",
  })
  userId: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "用户名",
  })
  userName: string;

  @Column({
    type: "tinyint",
    comment: "排序",
    default: 0,
  })
  sort: number;

  @Column({
    type: "tinyint",
    comment: "是否在用 0启用 1在用 2停用",
  })
  status: number;

  @Column({
    type: "datetime",
    nullable: true,
    comment: "token过期时间",
  })
  expiresAt: Date;

  @Column({
    type: "datetime",
    nullable: true,
    comment: "token颁发时间",
  })
  issuedAt: Date;

  @Column({
    type: "varchar",
    length: 255,
    comment: "华为后台用户所属的域id",
  })
  bpId: string;

  @Column({
    type: "text",
    comment: "令牌",
  })
  token: string;
}
