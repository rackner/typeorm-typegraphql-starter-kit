import { User } from '../../entities';
import { AuthTokens } from '../../interfaces';
import { LoginIdentityTypes } from '../../enums';
import { ApolloError } from 'apollo-server-express';
import { sign } from 'jsonwebtoken';

export const retrieveAuthTokens = (
  user: User,
  identityTypes: LoginIdentityTypes[],
): AuthTokens => {
  const fourteenDays = 60 * 60 * 24 * 14 * 1000;
  const twoHours = 60 * 120 * 1000;

  const accessSecret: string = <string>process.env.JWT_ACCESS_SECRET;
  if (!accessSecret)
    throw new ApolloError(
      'Must define JWT access secret in .env file',
      'JWT_ACCESS_SECRET_MISSING',
    );

  const refreshSecret: string = <string>process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret)
    throw new ApolloError(
      'Must define JWT refresh secret in .env file',
      'JWT_REFRESH_SECRET_MISSING',
    );

  const accessToken = sign({ user, identityTypes }, accessSecret, {
    expiresIn: twoHours,
  });
  const refreshToken = sign({ user, identityTypes }, refreshSecret, {
    expiresIn: fourteenDays,
  });

  return { accessToken, refreshToken };
};
