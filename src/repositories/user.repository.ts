import { User, LoginIdentity } from '../entities';
import { LoadRelation } from '../interfaces';
import { AddUserInput, UpdateUserInput } from '../input-types';
import { LoginIdentityTypes, UserRoleTypes } from '../enums';
import {
  EntityRepository,
  Repository,
  InsertResult,
  getConnection,
} from 'typeorm';

// Note, some method names are restricted (create, findOne), since TypeORM
// already reserves these methods for use
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async createOne({
    loginIdentities,
    ...addUserInput
  }: Partial<User>): Promise<User> {
    const res: InsertResult = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(addUserInput)
      .execute();

    const addedUser: User = {
      ...res.raw[0],
      ...addUserInput,
    };

    if (!!loginIdentities?.length) {
      const newLoginIdentityRes: InsertResult = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(LoginIdentity)
        .values(
          loginIdentities.map(
            identity => new LoginIdentity({ ...identity, user: addedUser }),
          ),
        )
        .execute();

      const newLoginIdentities = loginIdentities.map(
        (identity, index) =>
          new LoginIdentity({
            ...newLoginIdentityRes.raw[index],
            ...identity,
          }),
      );

      addedUser.loginIdentities = newLoginIdentities;
    }

    return addedUser;
  }

  public async updateOne(
    updateUserInput: UpdateUserInput,
  ): Promise<Partial<User>> {
    // This retrieves all the database columns on the user table
    const attributes = getConnection()
      .getMetadata(User)
      .ownColumns.map(column => column.propertyName);

    // Remove any attribute from the input that is not a column in the table
    Object.keys(updateUserInput).forEach(
      attr => !attributes.includes(attr) && delete updateUserInput[attr],
    );

    // Separate ID, since you do not update this (but need in request)
    const { id, ...partialUser } = new User(updateUserInput, 'update');

    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set(partialUser)
      .where('id = :id', { id })
      .execute();

    // We fake the updated at column here to avoid having to refetch the user
    // after it has been updated. If updated at needs to be more accurate, then
    // must refetch user after this function completes
    return { id, ...partialUser, updatedAt: new Date() };
  }

  public async loadIdentity(
    userId: string,
    identityType: LoginIdentityTypes,
  ): Promise<LoginIdentity | null> {
    return (
      (
        await this.createQueryBuilder('user')
          .leftJoinAndSelect(
            'user.loginIdentities',
            'identity',
            'identity.type = :type',
            { type: identityType },
          )
          .getOne()
      )?.loginIdentities?.[0] ?? null
    );
  }

  public async identityTypes(userId: string): Promise<LoginIdentityTypes[]> {
    return (
      await this.loadRelation({
        relation: 'loginIdentities',
        id: userId,
        loadMany: true,
      })
    ).map(({ type }) => LoginIdentityTypes[type]);
  }

  public async roleTypes(userId: string): Promise<UserRoleTypes[]> {
    const user = await this.createQueryBuilder('user')
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

  public async loadRelation({
    relation,
    id,
    loadMany,
  }: LoadRelation): Promise<any> {
    return await getConnection()
      .createQueryBuilder()
      .relation(User, relation)
      .of(id)
      [`load${!!loadMany ? 'Many' : 'One'}`]();
  }
}
