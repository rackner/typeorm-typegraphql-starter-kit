import { UserRepository } from '../../repositories';

// All delete user logic should go here
export const deleteUser = async (
  id: string,
  getUser,
  userRepo: UserRepository,
): Promise<String> => {
  const prevUser = await getUser({ value: id });

  await userRepo.delete(id);

  return `User id ${id} deleted successfully`;
};
