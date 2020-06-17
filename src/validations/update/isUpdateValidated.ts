import { ClassType } from 'type-graphql';
import { ValidationError, AuthScoperOptions } from '../../interfaces';
import { EntityTypes } from '../../enums';
import { getRepository } from 'typeorm';
import { User } from '../../entities';

export const isUpdateValidated = async (
  fieldName: string,
  args: any,
): Promise<ValidationError[] | boolean> => {
  const { repository, repositories } = fetchRepositories(fieldName);
  // Scope off of fieldName (aka resolver function name)
  switch (fieldName) {
    default:
      return [];
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
