import { Admin, User } from '../entities';
import { FindOneArgs, FindManyArgs } from '../args-types';
import { AddAdminInput } from '../input-types';
import { LoadRelation } from '../interfaces';
import {
  EntityRepository,
  Repository,
  InsertResult,
  getConnection,
} from 'typeorm';

// Note, some method names are restricted (create, findOne), since TypeORM
// already reserves these methods for use
@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {
  public async createOne(adminUser: User): Promise<Admin> {
    const newAdmin = new Admin({
      user: adminUser,
    });

    // Create new admin. Should automatically add user as relation
    const adminRes: InsertResult = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Admin)
      .values(newAdmin)
      .execute();

    return {
      ...adminRes.raw[0],
      ...newAdmin,
    };
  }

  public async loadRelation({
    relation,
    id,
    loadMany,
  }: LoadRelation): Promise<any> {
    return await getConnection()
      .createQueryBuilder()
      .relation(Admin, relation)
      .of(id)
      [`load${!!loadMany ? 'Many' : 'One'}`]();
  }
}
