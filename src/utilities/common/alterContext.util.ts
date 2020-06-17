import { User } from '../../entities';
import { LoginIdentityTypes } from '../../enums';
import { verify } from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { Context } from '../../interfaces';
import { Request, Response } from 'express';
import { retrieveAuthTokens, getOne } from '..';

export const alterContext = async (
  req: Request,
  res: Response,
): Promise<Context> => {
  const refreshToken = <string>req.headers['x-refresh-token'];
  const accessToken = <string>req.headers['x-access-token'];

  if (!accessToken && !refreshToken) return {};

  const decodedAccessToken = decodeAccessToken(accessToken);
  if (!!decodedAccessToken && !!decodedAccessToken.user)
    return { user: decodedAccessToken.user };

  const decodedRefreshToken = decodeRefreshToken(refreshToken);
  if (!!decodedRefreshToken && !!decodedRefreshToken.user) {
    // Check if user is still valid
    const user: User = await getOne(
      {
        value: decodedRefreshToken.user.id,
        relations: [
          { relation: 'entity.admin', name: 'admin' },
          { relation: 'entity.superAdmin', name: 'superAdmin' },
          { relation: 'entity.customer', name: 'customer' },
        ],
      },
      getRepository(User),
    );

    if (!user) return {};

    const userRoles = await user.getRoleTypes();
    user.roleTypes = userRoles;

    const updatedAuthTokens = retrieveAuthTokens(
      user,
      decodedRefreshToken.identityTypes,
    );

    res.set({
      'Access-Control-Expose-Headers': 'x-access-token,x-refresh-token',
      'x-access-token': updatedAuthTokens.accessToken,
      'x-refresh-token': updatedAuthTokens.refreshToken,
    });

    return { user };
  }

  return {};
};

const decodeAccessToken = (accessToken: string): DecodedToken | void => {
  try {
    return <DecodedToken>(
      verify(accessToken, <string>process.env.JWT_ACCESS_SECRET)
    );
  } catch (err) {}
};

const decodeRefreshToken = (refreshToken: string): DecodedToken | void => {
  try {
    return <DecodedToken>(
      verify(refreshToken, <string>process.env.JWT_REFRESH_SECRET)
    );
  } catch (err) {}
};

interface DecodedToken {
  user: User;
  iat: number;
  exp: number;
  identityTypes: LoginIdentityTypes[];
}
