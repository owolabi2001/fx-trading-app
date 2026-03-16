import {
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';

export abstract class BaseSharedEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedOn?: Date;
}

export abstract class SharedEntity extends BaseSharedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export abstract class IntSharedEntity extends BaseSharedEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: bigint;
}
