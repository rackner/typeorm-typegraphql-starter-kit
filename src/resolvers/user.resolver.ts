import { InjectRepository } from 'typeorm-typedi-extensions';
import { Inject } from 'typedi';
import { User, SuperAdmin, Image, Admin, Customer } from '../entities';
import { UserRepository } from '../repositories';
import { updateUser, deleteUser, getOne } from '../utilities';
import { UpdateUserInput } from '../input-types';
import { createBaseGateway } from '../resolvers';
import { S3Service } from '../services';
import {
  UserRoleTypes,
  ActionTypes,
  EntityTypes,
  LoginIdentityTypes,
} from '../enums';
import {
  Resolver,
  Query,
  Arg,
  ID,
  Mutation,
  FieldResolver,
  Root,
  ResolverInterface,
  Authorized,
} from 'type-graphql';

const UserBaseGateway = createBaseGateway(User, 'User');

@Resolver()
export class UserGateways extends UserBaseGateway {
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;

  @Query(returns => [LoginIdentityTypes], {
    description: 'Displays the type of login for a user',
  })
  async userLoginIdentityTypes(
    @Arg('emailAddress') emailAddress: string,
  ): Promise<LoginIdentityTypes[]> {
    const user: User = await getOne(
      {
        value: emailAddress,
        attribute: 'emailAddress',
      },
      this.userRepo,
    );

    if (!user) return [];

    return user.getLoginTypes();
  }

  @Mutation(returns => User, { description: 'Update an existing user' })
  @Authorized({
    orRoles: [UserRoleTypes.SUPER_ADMIN, UserRoleTypes.CUSTOMER],
    type: ActionTypes.UPDATE,
    entity: EntityTypes.USER,
    validateScope: true,
  })
  async updateUser(
    @Arg('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return await updateUser(
      updateUserInput,
      this.getOne.bind(this),
      this.userRepo,
    );
  }

  @Mutation(returns => String, { description: 'Delete an existing user' })
  @Authorized(UserRoleTypes.SUPER_ADMIN)
  async deleteUser(@Arg('id', type => ID) id: string): Promise<String> {
    return await deleteUser(id, this.getOne.bind(this), this.userRepo);
  }
}

@Resolver(of => User)
export class UserResolver implements ResolverInterface<User> {
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;
  @Inject()
  private readonly s3Service: S3Service;

  @FieldResolver(returns => SuperAdmin, {
    nullable: true,
    description: 'If a user is a super admin, fetch their super-admin data',
  })
  async superAdmin(@Root() user: User) {
    return await this.userRepo.loadRelation({
      relation: 'superAdmin',
      id: user.id,
    });
  }

  @FieldResolver(returns => Admin, {
    nullable: true,
    description: 'If a user is a admin, fetch their admin data',
  })
  async admin(@Root() user: User) {
    return await this.userRepo.loadRelation({
      relation: 'admin',
      id: user.id,
    });
  }

  @FieldResolver(returns => Customer, {
    nullable: true,
    description: 'If a user is a customer, fetch their customer data',
  })
  async customer(@Root() user: User) {
    return await this.userRepo.loadRelation({
      relation: 'customer',
      id: user.id,
    });
  }

  @FieldResolver(returns => String, {
    nullable: true,
    description: 'Fetch a pre-signed URL to retrieve the image from',
  })
  async imageUrl(@Root() user: User): Promise<String | void> {
    const img = await this.userRepo.loadRelation({
      relation: 'image',
      id: user.id,
    });

    if (!!img)
      return await this.s3Service.getSignedDownloadUrl(
        `users/${img.filename}`,
        process.env.IMAGE_BUCKET_NAME,
      );
  }

  @FieldResolver(returns => [UserRoleTypes])
  async roleTypes(@Root() user: User): Promise<UserRoleTypes[]> {
    return user.getRoleTypes();
  }

  @FieldResolver(returns => [LoginIdentityTypes])
  async loginTypes(@Root() user: User): Promise<LoginIdentityTypes[]> {
    return user.getLoginTypes();
  }
}
