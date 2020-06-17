import { registerEnumType } from 'type-graphql';

export enum LoginIdentityTypes {
  LOCAL = 'LOCAL',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
}

registerEnumType(LoginIdentityTypes, {
  name: 'LoginIdentitiesTypes', // this one is mandatory
  description: 'The different types of login we allow for cuzi', // this one is optional
});
