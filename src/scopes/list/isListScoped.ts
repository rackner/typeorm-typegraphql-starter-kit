import { AuthScoperOptions } from '../../interfaces';
import { EntityTypes } from '../../enums';

export const isListScoped = async ({
  entity,
  fieldName,
  user,
  args,
  ...options
}: AuthScoperOptions): Promise<boolean> => {
  // First, scope based off entity
  switch (entity) {
    // If we do not have an entity scope, then scope off of fieldName (aka resolver funciton name)
    default:
      switch (fieldName) {
        default:
          return false;
      }
  }
};
