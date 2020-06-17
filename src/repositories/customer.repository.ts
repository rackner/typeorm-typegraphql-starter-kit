import { Customer, User } from '../entities';
import { FindOneArgs, FindManyArgs } from '../args-types';
import { AddCustomerInput } from '../input-types';
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
@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {
  public async createOne(customerUser: User): Promise<Customer> {
    const newCustomer = new Customer({
      user: customerUser,
    });

    // Create new customer. Should automatically add user as relation
    const customerRes: InsertResult = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Customer)
      .values(newCustomer)
      .execute();

    return {
      ...customerRes.raw[0],
      ...newCustomer,
    };
  }

  public async loadRelation({
    relation,
    id,
    loadMany,
  }: LoadRelation): Promise<any> {
    return await getConnection()
      .createQueryBuilder()
      .relation(Customer, relation)
      .of(id)
      [`load${!!loadMany ? 'Many' : 'One'}`]();
  }
}
