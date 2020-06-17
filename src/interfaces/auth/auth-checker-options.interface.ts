import { UserRoleTypes, ActionTypes, EntityTypes } from '../../enums';

export interface AuthCheckerOptions {
  // must have this role to pass
  role?: UserRoleTypes;

  // must have one of these roles to pass
  andRoles?: UserRoleTypes[];

  // must have all of these roles to pass
  orRoles?: UserRoleTypes[];

  type?: ActionTypes;

  entity?: EntityTypes;

  validateScope?: boolean;
}
