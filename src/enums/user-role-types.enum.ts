import { registerEnumType } from 'type-graphql';

export enum UserRoleTypes {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

registerEnumType(UserRoleTypes, {
  name: 'UserRoleTypes', // this one is mandatory
  description:
    'The types of user allowed in cuzi apps, possibilities are CUSTOMER, ADMIN, or SUPER_ADMIN', // this one is optional
});
