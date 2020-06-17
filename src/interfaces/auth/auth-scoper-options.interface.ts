import { User } from '../../entities';
import { EntityTypes } from '../../enums';

export interface AuthScoperOptions {
  user: User;

  entity?: EntityTypes;

  args?: any;

  fieldName: string;
}
