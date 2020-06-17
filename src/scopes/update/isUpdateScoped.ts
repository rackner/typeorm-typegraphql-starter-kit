import { AuthScoperOptions } from '../../interfaces';
import { EntityTypes, UserRoleTypes } from '../../enums';
import { isUserUpdateScoped } from './user.scope';

export const isUpdateScoped = async ({
  entity,
  fieldName,
  user,
  args,
}: AuthScoperOptions): Promise<boolean> => {
  // First, scope based off entity
  switch (entity) {
    case EntityTypes.USER:
      return isUserUpdateScoped(args?.updateUserInput, user);
    // If we do not have an entity scope, then scope off of fieldName (aka resolver funciton name)
    default:
      switch (fieldName) {
        default:
          return false;
      }
  }
};
