import { AuthScoperOptions, ValidationError } from '../../interfaces';
import { EntityTypes } from '../../enums';
import { getRepository } from 'typeorm';

export const isRetrieveValidated = async (
  fieldName: string,
  args: any,
): Promise<ValidationError[] | boolean> => {
  const { repository, repositories } = fetchRepositories(fieldName);

  // Scope off of fieldName (aka resolver function name)
  switch (fieldName) {
    default:
      return false;
  }
};

const fetchRepositories = (
  fieldName: string,
): { repository?: any; repositories?: any } => {
  switch (fieldName) {
    default:
      return {};
  }
};
