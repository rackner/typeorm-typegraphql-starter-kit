import { InjectRepository } from 'typeorm-typedi-extensions';
import { SuperAdmin, User } from '../entities';
import { SuperAdminRepository, UserRepository } from '../repositories';
import { addSuperAdmin, deleteSuperAdmin } from '../utilities';
import { AddSuperAdminInput } from '../input-types';
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

const SuperAdminBaseGateway = createBaseGateway(SuperAdmin, 'Super Admin');

// No update on super admin for now.
// TODO: Add specific permissions on super admin (these should be updateable)
@Resolver()
export class SuperAdminGateways extends SuperAdminBaseGateway {
  @InjectRepository(SuperAdminRepository)
  private readonly superAdminRepo: SuperAdminRepository;
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;

  @Mutation(returns => SuperAdmin, { description: 'Create a super admin' })
  // @Authorized(UserRoleTypes.SUPER_ADMIN)
  @ValidateArgs(ActionTypes.CREATE)
  async addSuperAdmin(
    @Arg('addSuperAdminInput') addSuperAdminInput: AddSuperAdminInput,
  ): Promise<SuperAdmin> {
    return await addSuperAdmin(
      addSuperAdminInput,
      this.userRepo,
      this.superAdminRepo,
    );
  }

  @Mutation(returns => String, {
    description: 'Delete an existing super admin, leaving its user intact',
  })
  @Authorized(UserRoleTypes.SUPER_ADMIN)
  async deleteSuperAdmin(@Arg('id', type => ID) id: string): Promise<String> {
    return await deleteSuperAdmin(
      id,
      this.getOne.bind(this),
      this.superAdminRepo,
    );
  }
}

@Resolver(of => SuperAdmin)
export class SuperAdminResolver implements ResolverInterface<SuperAdmin> {
  @InjectRepository(SuperAdminRepository)
  private readonly superAdminRepo: SuperAdminRepository;

  @FieldResolver(returns => User, {
    description: 'Fetch the data for their user',
  })
  async user(@Root() superAdmin: SuperAdmin) {
    return await this.superAdminRepo.loadRelation({
      relation: 'user',
      id: superAdmin.id,
    });
  }
}
