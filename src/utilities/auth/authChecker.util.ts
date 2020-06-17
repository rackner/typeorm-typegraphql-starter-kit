import { AuthChecker } from 'type-graphql';
import { Context, AuthCheckerOptions } from '../../interfaces';
import { User } from '../../entities';
import { UserRoleTypes, ActionTypes } from '../../enums';
import {
  isListScoped,
  isRetrieveScoped,
  isCreateScoped,
  isUpdateScoped,
  isDeleteScoped,
} from '../../scopes';

export const authChecker: AuthChecker<Context> = async (
  { root, args, context, info },
  options: string[] | AuthCheckerOptions[],
) => {
  const user = context.user;
  if (!user) return false;

  const hasValidRoles: boolean = checkRoles(user, options);
  if (!hasValidRoles) return false;

  let hasValidScope: boolean | Promise<boolean>;
  if (
    !!options?.length &&
    typeof options[0] !== 'string' &&
    !!options?.[0].type &&
    !!options?.[0].validateScope
  ) {
    hasValidScope = await checkScope(user, options[0], args, info.fieldName);

    if (!hasValidScope) return false;
  }

  return true;
};

const checkScope = async (
  user: User,
  { entity, type }: AuthCheckerOptions,
  args,
  fieldName: string,
): Promise<boolean> => {
  switch (type) {
    case ActionTypes.LIST:
      return await isListScoped({ user, entity, args, fieldName });
    case ActionTypes.RETRIEVE:
      return await isRetrieveScoped({ user, entity, args, fieldName });
    case ActionTypes.CREATE:
      return await isCreateScoped({ user, entity, args, fieldName });
    case ActionTypes.UPDATE:
      return await isUpdateScoped({ user, entity, args, fieldName });
    case ActionTypes.DELETE:
      return await isDeleteScoped({ user, entity, args, fieldName });
    default:
      return false;
  }
};

const checkRoles = (
  user: User,
  options: string[] | AuthCheckerOptions[],
): boolean => {
  const getRoles = (roles: string[]): UserRoleTypes[] =>
    (user?.roleTypes ?? []).map(type => UserRoleTypes[type]);
  // Options will either be an empty array (if so pass on), an string array of roles,
  // or a array with a single item of type AuthCheckerOptions
  if (!!options?.length) {
    // String array of roles
    if (typeof options[0] === 'string') {
      const roles = getRoles(<string[]>options);

      return !roles.some(
        role => !user?.roleTypes?.includes(UserRoleTypes[role]),
      );
    } else {
      const { role, andRoles, orRoles } = <AuthCheckerOptions>options[0];

      if (!!role && !user?.roleTypes?.includes(UserRoleTypes[role]))
        return false;

      if (
        !!andRoles?.length &&
        andRoles.some(role => !user?.roleTypes?.includes(UserRoleTypes[role]))
      )
        return false;

      if (
        !!orRoles?.length &&
        !orRoles.some(role => user?.roleTypes?.includes(UserRoleTypes[role]))
      )
        return false;
    }
  }

  return true;
};
