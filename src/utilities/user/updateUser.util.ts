import { UserRepository } from '../../repositories';
import { UpdateUserInput } from '../../input-types';
import { User } from '../../entities';

// All update user logic should go here
export const updateUser = async (
  updateUserInput: UpdateUserInput,
  getUser,
  userRepo: UserRepository,
): Promise<User> => {
  const prevUser = await getUser({ value: updateUserInput.id });

  const partialUser = await userRepo.updateOne(updateUserInput);

  return { ...prevUser, ...partialUser };
};
