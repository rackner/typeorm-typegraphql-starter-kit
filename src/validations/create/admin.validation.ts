import { AddAdminInput } from '../../input-types';
import { UserRepository } from '../../repositories';
import { LoginIdentityTypes, UserRoleTypes } from '../../enums';
import { ApolloError } from 'apollo-server-express';
import { User } from '../../entities';
import { ValidationError } from '../../interfaces';
import { getOne } from '../../utilities';

export const addAdminValidated = async (
  addAdminInput: AddAdminInput,
  userRepo: UserRepository,
): Promise<ValidationError[]> => {
  const user: User = await getOne(
    {
      value: addAdminInput.emailAddress,
      attribute: 'emailAddress',
    },
    userRepo,
  );

  let validationErrors: ValidationError[] = [];
  let missingProps: string[] = [];
  // If there is already a pre-existing user
  if (!!user) {
    const roleTypes: UserRoleTypes[] = await user.getRoleTypes();
    const loginTypes: LoginIdentityTypes[] = await user.getLoginTypes();

    // If already a admin, throw error (do not validate rest as the input is irrelevant)
    if (!!roleTypes.includes(UserRoleTypes.ADMIN))
      throw new ApolloError('User is already a admin', 'ADMIN_EXISTS');

    // If user previously had password
    if (!!loginTypes.includes(LoginIdentityTypes.LOCAL)) {
      if (!!addAdminInput.password)
        validationErrors.push({
          attribute: 'password',
          message: 'Password already exists on user',
          code: 'PRE_EXISTING_PASSWORD',
        });
    } else {
      if (!addAdminInput.password)
        validationErrors.push({
          attribute: 'password',
          message: 'Admin requires password',
          code: 'REQUIRES_PASSWORD',
        });
    }

    // Admin requires first and last name as well
    missingProps = ['firstName', 'lastName'].filter(
      key => !user[key] && !addAdminInput[key],
    );
  } else {
    // If user needs to be created, then the admin requires ALL properties
    missingProps = ['password', 'firstName', 'lastName'].filter(
      key => !addAdminInput[key],
    );
  }

  if (!!missingProps.length)
    missingProps.forEach(key =>
      validationErrors.push({
        attribute: key,
        message: `Admin requires ${key}`,
        code: `REQUIRES_${key.toUpperCase()}`,
      }),
    );

  return validationErrors;
};
