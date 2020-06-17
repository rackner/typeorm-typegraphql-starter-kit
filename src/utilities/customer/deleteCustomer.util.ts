import { CustomerRepository } from '../../repositories';

// All delete customer logic should go here
export const deleteCustomer = async (
  id: string,
  getCustomer,
  customerRepo: CustomerRepository,
): Promise<String> => {
  const prevCustomer = await getCustomer({ value: id });

  // Instead of actually deleting customer, just set as deleted
  await customerRepo.update(id, { deleted: true });

  return `Customer id ${id} deleted successfully`;
};
