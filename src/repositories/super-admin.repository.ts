import { SuperAdmin, User } from '../entities';
import { FindOneArgs, FindManyArgs } from '../args-types';
import { AddSuperAdminInput } from '../input-types';
import { LoadRelation } from '../interfaces';
import { ApolloError } from 'apollo-server-express';
import {
  EntityRepository,
  Repository,
  InsertResult,
  getConnection,
} from 'typeorm';

// Note, some method names are restricted (create, findOne), since TypeORM
// already reserves these methods for use
@EntityRepository(SuperAdmin)
export class SuperAdminRepository extends Repository<SuperAdmin> {
  public async createOne(superAdminUser: User): Promise<SuperAdmin> {
    const newSuperAdmin = new SuperAdmin({
      user: superAdminUser,
    });

    // Create new super admin. Should automatically add user as relation
    const superAdminRes: InsertResult = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(SuperAdmin)
      .values(newSuperAdmin)
      .execute();

    return {
      ...superAdminRes.raw[0],
      ...newSuperAdmin,
    };
  }

  public async loadRelation({
    relation,
    id,
    loadMany,
  }: LoadRelation): Promise<any> {
    return await getConnection()
      .createQueryBuilder()
      .relation(SuperAdmin, relation)
      .of(id)
      [`load${!!loadMany ? 'Many' : 'One'}`]();
  }
}
