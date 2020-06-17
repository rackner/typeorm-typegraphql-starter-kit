import { InjectRepository } from 'typeorm-typedi-extensions';
import { Address, Customer } from '../entities';
import { AddressRepository } from '../repositories';
import { createBaseGateway } from '../resolvers';
import { ValidateArgs } from '../decorators';
import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';

const AddressBaseGateway = createBaseGateway(Address, 'Address');

@Resolver()
export class AddressGateways extends AddressBaseGateway {
  @InjectRepository(AddressRepository)
  private readonly addressRepo: AddressRepository;
}

@Resolver(of => Address)
export class AddressResolver implements ResolverInterface<Address> {
  @InjectRepository(AddressRepository)
  private readonly addressRepo: AddressRepository;

  @FieldResolver(returns => Customer, {
    description: 'Resolves to the customer which owns the address',
  })
  async customer(@Root() address: Address) {
    return await this.addressRepo.loadRelation({
      relation: 'customer',
      id: address.id,
    });
  }
}
