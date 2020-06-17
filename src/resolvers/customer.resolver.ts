import { InjectRepository } from 'typeorm-typedi-extensions';
import { Customer, User, Address } from '../entities';
import { CustomerRepository, UserRepository } from '../repositories';
import { addCustomer, deleteCustomer } from '../utilities';
import { LoginResult } from '../interfaces';
import { AddCustomerInput } from '../input-types';
import { createBaseGateway } from '../resolvers';
import { UserRoleTypes, ActionTypes } from '../enums';
import { ValidateArgs } from '../decorators';
import {
  Resolver,
  Arg,
  ID,
  Mutation,
  FieldResolver,
  Root,
  ResolverInterface,
  Authorized,
} from 'type-graphql';

const CustomerBaseGateway = createBaseGateway(Customer, 'Customer');

// No update on customer for now.
// TODO: Add specific permissions on customer (these should be updateable)
@Resolver()
export class CustomerGateways extends CustomerBaseGateway {
  @InjectRepository(CustomerRepository)
  private readonly customerRepo: CustomerRepository;
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;

  @Mutation(returns => LoginResult, { description: 'Create a customer' })
  @ValidateArgs(ActionTypes.CREATE)
  async addCustomer(
    @Arg('addCustomerInput') addCustomerInput: AddCustomerInput,
  ): Promise<LoginResult> {
    return await addCustomer(
      addCustomerInput,
      this.userRepo,
      this.customerRepo,
    );
  }

  @Mutation(returns => String, {
    description: 'Delete an existing customer, leaving its user intact',
  })
  @Authorized(UserRoleTypes.SUPER_ADMIN)
  async deleteCustomer(@Arg('id', type => ID) id: string): Promise<String> {
    return await deleteCustomer(id, this.getOne.bind(this), this.customerRepo);
  }
}

@Resolver(of => Customer)
export class CustomerResolver implements ResolverInterface<Customer> {
  @InjectRepository(CustomerRepository)
  private readonly customerRepo: CustomerRepository;

  @FieldResolver(returns => User, {
    description: 'Fetch the user of a customer',
  })
  async user(@Root() customer: Customer) {
    return await this.customerRepo.loadRelation({
      relation: 'user',
      id: customer.id,
    });
  }

  @FieldResolver(returns => [Address], {
    description: 'Fetch the different addresses of a customer',
  })
  async addresses(@Root() customer: Customer) {
    return await this.customerRepo.loadRelation({
      relation: 'addresses',
      id: customer.id,
      loadMany: true,
    });
  }
}
