import { AdminRepository } from '../../repositories';
import { Admin } from '../../entities';

// All delete admin logic should go here
export const deleteAdmin = async (
  id: string,
  getAdmin,
  adminRepo: AdminRepository,
): Promise<String> => {
  const prevAdmin = await getAdmin({ value: id });

  await adminRepo.delete(id);

  return `Admin id ${id} deleted successfully`;
};
