import { LocalLoginInput } from '../../input-types';
import { LoginResult, AuthTokens } from '../../interfaces';
import { LoginIdentityTypes } from '../../enums';
import { UserRepository } from '../../repositories';
import { getOne, retrieveAuthTokens } from '..';
import { ApolloError } from 'apollo-server-express';
import { User } from '../../entities';

export const loginLocally = async (
  { emailAddress, password }: LocalLoginInput,
  userRepo: UserRepository,
): Promise<LoginResult> => {
  const user = await getOne(
    {
      value: emailAddress,
      attribute: 'emailAddress',
      relations: [
        { relation: 'entity.admin', name: 'admin' },
        { relation: 'entity.superAdmin', name: 'superAdmin' },
        { relation: 'entity.customer', name: 'customer' },
      ],
    },
    userRepo,
  );

  if (!user)
    throw new ApolloError('Email address not found', 'EMAIL_NOT_FOUND', {
      errorOnProperty: 'emailAddress',
    });

  const localIdentity = await userRepo.loadIdentity(
    user.id,
    LoginIdentityTypes.LOCAL,
  );
  if (!localIdentity)
    throw new ApolloError('User needs to add a password', 'REQUIRES_PASSWORD');

  const isValidPassword = await localIdentity.isValidPassword(password);
  if (!isValidPassword)
    throw new ApolloError('Invalid password', 'INVALID_PASSWORD', {
      errorOnProperty: 'password',
    });

  user.roleTypes = await user.getRoleTypes();
  const tokens: AuthTokens = retrieveAuthTokens(
    user,
    await userRepo.identityTypes(user.id),
  );

  return {
    user,
    tokens,
  };
};
