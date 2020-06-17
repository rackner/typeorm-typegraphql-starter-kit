import { InjectRepository } from 'typeorm-typedi-extensions';
import { Admin, User } from '../entities';
import { AdminRepository, UserRepository } from '../repositories';
import { addAdmin, deleteAdmin } from '../utilities';
import { AddAdminInput } from '../input-types';
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

const AdminBaseGateway = createBaseGateway(Admin, 'Admin');

// No update on admin for now.
// TODO: Add specific permissions on admin (these should be updateable)
@Resolver()
export class AdminGateways extends AdminBaseGateway {
  @InjectRepository(AdminRepository)
  private readonly adminRepo: AdminRepository;
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;

  @Mutation(returns => Admin, { description: 'Create a admin' })
  @Authorized({ orRoles: [UserRoleTypes.SUPER_ADMIN, UserRoleTypes.ADMIN] })
  @ValidateArgs(ActionTypes.CREATE)
  async addAdmin(
    @Arg('addAdminInput') addAdminInput: AddAdminInput,
  ): Promise<Admin> {
    return await addAdmin(addAdminInput, this.userRepo, this.adminRepo);
  }

  @Mutation(returns => String, {
    description: 'Delete an existing admin, leaving its user intact',
  })
  @Authorized(UserRoleTypes.SUPER_ADMIN)
  async deleteAdmin(@Arg('id', type => ID) id: string): Promise<String> {
    return await deleteAdmin(id, this.getOne.bind(this), this.adminRepo);
  }
}

@Resolver(of => Admin)
export class AdminResolver implements ResolverInterface<Admin> {
  @InjectRepository(AdminRepository)
  private readonly adminRepo: AdminRepository;

  @FieldResolver(returns => User, {
    description: 'Fetch the data for their user',
  })
  async user(@Root() admin: Admin) {
    return await this.adminRepo.loadRelation({
      relation: 'user',
      id: admin.id,
    });
  }
}
