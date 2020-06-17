import { ClassType } from 'type-graphql';
import { ValidationError, AuthScoperOptions } from '../../interfaces';
import { EntityTypes } from '../../enums';
import { addSuperAdminValidated } from './superAdmin.validation';
import { addAdminValidated } from './admin.validation';
import { addCustomerValidated } from './customer.validation';
import { UserRepository } from '../../repositories';
import { getRepository } from 'typeorm';
import { User } from '../../entities';

export const isCreateValidated = async (
  fieldName: string,
  args: any,
): Promise<ValidationError[] | boolean> => {
  const { repository, repositories } = fetchRepositories(fieldName);
  // Scope off of fieldName (aka resolver funciton name)
  switch (fieldName) {
    case 'addSuperAdmin':
      return await addSuperAdminValidated(
        args.addSuperAdminInput,
        <UserRepository>repository,
      );
    case 'addAdmin':
      return await addAdminValidated(
        args.addAdminInput,
        <UserRepository>repository,
      );
    case 'addCustomer':
      return await addCustomerValidated(
        args.addCustomerInput,
        <UserRepository>repository,
      );
    default:
      return [];
  }
};

const fetchRepositories = (
  fieldName: string,
): { repository?: any; repositories?: any } => {
  switch (fieldName) {
    case 'addSuperAdmin':
    case 'addAdmin':
    case 'addCustomer':
      return { repository: getRepository(User) };
    default:
      return {};
  }
};
