import { Address } from '../entities';
import { FindOneArgs, FindManyArgs } from '../args-types';
import { LoadRelation } from '../interfaces';
import {
  EntityRepository,
  Repository,
  InsertResult,
  getConnection,
} from 'typeorm';

// Note, some method names are restricted (create, findOne), since TypeORM
// already reserves these methods for use
@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {
  public async loadRelation({
    relation,
    id,
    loadMany,
  }: LoadRelation): Promise<any> {
    return await getConnection()
      .createQueryBuilder()
      .relation(Address, relation)
      .of(id)
      [`load${!!loadMany ? 'Many' : 'One'}`]();
  }
}
