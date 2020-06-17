import { AddSuperAdminInput } from '../../input-types';
import { UserRepository } from '../../repositories';
import { LoginIdentityTypes, UserRoleTypes } from '../../enums';
import { ApolloError } from 'apollo-server-express';
import { User } from '../../entities';
import { ValidationError } from '../../interfaces';
import { getOne } from '../../utilities';

export const addSuperAdminValidated = async (
  addSuperAdminInput: AddSuperAdminInput,
  userRepo: UserRepository,
): Promise<ValidationError[]> => {
  const user: User = await getOne(
    {
      value: addSuperAdminInput.emailAddress,
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

    // If already a super admin, throw error (do not validate rest as the input is irrelevant)
    if (!!roleTypes.includes(UserRoleTypes.SUPER_ADMIN))
      throw new ApolloError(
        'User is already a super admin',
        'SUPER_ADMIN_EXISTS',
      );

    // If user previously had password
    if (!!loginTypes.includes(LoginIdentityTypes.LOCAL)) {
      if (!!addSuperAdminInput.password)
        validationErrors.push({
          attribute: 'password',
          message: 'Password already exists on user',
          code: 'PRE_EXISTING_PASSWORD',
        });
    } else {
      if (!addSuperAdminInput.password)
        validationErrors.push({
          attribute: 'password',
          message: 'Super admin requires password',
          code: 'REQUIRES_PASSWORD',
        });
    }

    // Super admin requires first and last name as well
    missingProps = ['firstName', 'lastName'].filter(
      key => !user[key] && !addSuperAdminInput[key],
    );
  } else {
    // If user needs to be created, then the super admin requires ALL properties
    missingProps = ['password', 'firstName', 'lastName'].filter(
      key => !addSuperAdminInput[key],
    );
  }

  if (!!missingProps.length)
    missingProps.forEach(key =>
      validationErrors.push({
        attribute: key,
        message: `Super admin requires ${key}`,
        code: `REQUIRES_${key.toUpperCase()}`,
      }),
    );

  return validationErrors;
};
