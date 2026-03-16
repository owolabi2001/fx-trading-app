import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  UpdateResult,
  DeleteResult,
  FindOptionsWhere,
  SelectQueryBuilder,
  QueryRunner,
  FindOneOptions,
  FindManyOptions,
  RemoveOptions,
  ObjectLiteral,
  InsertResult,
} from 'typeorm';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

@Injectable()
export class BaseAdapter<Entity extends ObjectLiteral> {
  constructor(private readonly repository: Repository<Entity>) {}

  async findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findOne(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity | null> {
    return this.repository.findOneBy(where);
  }

  async getOne(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    options: Omit<FindOneOptions<Entity>, 'where'> = {},
  ): Promise<Entity | null> {
    return this.repository.findOne({ where, ...options });
  }

  async create(data: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(
    criteria: number | string | FindOptionsWhere<Entity>,
    data: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.update(criteria, data);
  }

  async upsert(
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
    conflictPathsOrOptions: string[] | UpsertOptions<Entity>,
  ): Promise<InsertResult> {
    return this.repository.upsert(entityOrEntities, conflictPathsOrOptions);
  }

  async increment(
    condition: FindOptionsWhere<Entity>,
    property: string,
    value: number,
  ): Promise<UpdateResult> {
    return this.repository.increment(condition, property, value);
  }

  async decrement(
    condition: FindOptionsWhere<Entity>,
    property: string,
    value: number,
  ): Promise<UpdateResult> {
    return this.repository.decrement(condition, property, value);
  }

  async delete(
    criteria: number | string | FindOptionsWhere<Entity>,
  ): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }

  async remove(entities: Entity[], options?: RemoveOptions) {
    return this.repository.remove(entities, options);
  }

  async softDelete(
    criteria: number | string | FindOptionsWhere<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.softDelete(criteria);
  }

  async findByCondition(
    condition: FindOptionsWhere<Entity>,
  ): Promise<Entity[]> {
    return this.repository.findBy(condition);
  }

  async findMany(
    condition: FindOptionsWhere<Entity>,
    options: Omit<FindManyOptions<Entity>, 'where'> = {},
  ): Promise<Entity[]> {
    return this.repository.find({ where: condition, ...options });
  }

  async findOneByCondition(
    condition: FindOptionsWhere<Entity>,
  ): Promise<Entity | null> {
    return this.repository.findOneBy(condition);
  }

  async findPaginatedByCondition(
    condition: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    take: number,
    skip: number,
    options: Omit<FindManyOptions<Entity>, 'where' | 'take' | 'skip'> = {},
  ): Promise<[Entity[], number]> {
    return this.repository.findAndCount({
      where: condition,
      take,
      skip,
      ...options,
    });
  }

  async countByCondition(
    condition: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<number> {
    return this.repository.countBy(condition);
  }

  async count(
    condition: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    options: Omit<FindManyOptions<Entity>, 'where'> = {},
  ): Promise<number> {
    return this.repository.count({ where: condition, ...options });
  }

  async exists(
    condition: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    options: Omit<FindManyOptions<Entity>, 'where'> = {},
  ): Promise<boolean> {
    return this.repository.exists({ where: condition, ...options });
  }

  async sum(
    columnName: PickKeysByType<Entity, number>,
    condition?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ) {
    return this.repository.sum(columnName, condition);
  }

  async createMany(records: DeepPartial<Entity>[]): Promise<Entity[]> {
    const entities = this.repository.create(records);
    return this.repository.save(entities);
  }

  queryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): SelectQueryBuilder<Entity> {
    return this.repository.createQueryBuilder(alias, queryRunner);
  }
}
