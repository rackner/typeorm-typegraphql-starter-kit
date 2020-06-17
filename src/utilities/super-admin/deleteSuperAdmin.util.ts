import { SuperAdminRepository } from '../../repositories';

// All delete super admin logic should go here
export const deleteSuperAdmin = async (
  id: string,
  getSuperAdmin,
  superAdminRepo: SuperAdminRepository,
): Promise<String> => {
  const prevSuperAdmin = await getSuperAdmin({ value: id });

  await superAdminRepo.delete(id);

  return `Super Admin id ${id} deleted successfully`;
};
