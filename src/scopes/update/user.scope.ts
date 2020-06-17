import { UpdateUserInput } from '../../input-types';
import { User } from '../../entities';
import { UserRoleTypes } from '../../enums';

export const isUserUpdateScoped = (
  updateUserInput: UpdateUserInput,
  currentUser: User,
): boolean => {
  // You should be able to update your own user
  if (currentUser.id === updateUserInput?.id) return true;

  // Super admins should be able to update users
  if ((currentUser?.roleTypes ?? []).includes(UserRoleTypes.SUPER_ADMIN))
    return true;

  // All other instances,
  return false;
};
