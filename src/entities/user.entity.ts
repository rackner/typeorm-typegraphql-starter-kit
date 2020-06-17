import { Column, Entity, OneToOne, OneToMany, getRepository } from 'typeorm';
import { BaseEntity } from './base-entity.entity';
import { LoginIdentityTypes, UserRoleTypes } from '../enums';
import { ObjectType, Field, Int } from 'type-graphql';
import { SuperAdmin } from './super-admin.entity';
import { Image } from './image.entity';
import { Customer } from './customer.entity';
import { Admin } from './admin.entity';
import { LoginIdentity } from './login-identity.entity';

@Entity()
@ObjectType({
  description:
    'User entity. Base model used for logging in and base-user information shared across all applications',
})
export class User extends BaseEntity {
  @Field({ nullable: true, description: 'Email address of the user' })
  @Column({ unique: true })
  public emailAddress: string;

  @Field({ nullable: true, description: 'First name of the user' })
  @Column({ nullable: true })
  public firstName: string;

  @Field({ nullable: true, description: 'Last name of the user' })
  @Column({ nullable: true })
  public lastName: string;

  @Field({ nullable: true, description: 'Phone number of the user' })
  @Column({ nullable: true })
  public phoneNumber: string;

  @OneToOne(type => SuperAdmin, superAdmin => superAdmin.user)
  public superAdmin?: SuperAdmin;

  @OneToOne(type => Customer, customer => customer.user)
  public customer?: Customer;

  @OneToOne(type => Admin, admin => admin.user)
  public admin?: Admin;

  @OneToOne(type => Image, image => image.user)
  public image?: Image;

  @OneToMany(type => LoginIdentity, loginIdentity => loginIdentity.user)
  public loginIdentities: LoginIdentity[];

  // Do not add decorators
  public identityTypes?: LoginIdentityTypes[];
  public roleTypes?: UserRoleTypes[];

  constructor(partial: Partial<User>, constructOption?: 'create' | 'update') {
    super();

    Object.assign(this, partial);

    if (!!constructOption && ['create', 'update'].includes(constructOption)) {
      delete this.createdAt;
      delete this.updatedAt;

      if (constructOption === 'create') delete this.id;
    }
  }

  public async getRoleTypes(): Promise<UserRoleTypes[]> {
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .leftJoinAndSelect('user.admin', 'admin')
      .leftJoinAndSelect('user.superAdmin', 'superAdmin')
      .select(['user.id', 'superAdmin.id', 'admin.id', 'customer.id'])
      .getOne();

    const roleTypes: UserRoleTypes[] = [];
    if (user?.customer) roleTypes.push(UserRoleTypes.CUSTOMER);
    if (user?.admin) roleTypes.push(UserRoleTypes.ADMIN);
    if (user?.superAdmin) roleTypes.push(UserRoleTypes.SUPER_ADMIN);

    return roleTypes;
  }

  public async getLoginTypes(): Promise<LoginIdentityTypes[]> {
    const user = await getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.loginIdentities', 'identity')
      .select(['user.id', 'identity.type'])
      .getOne();

    return (
      user?.loginIdentities?.map(({ type }) => LoginIdentityTypes[type]) || []
    );
  }
}
