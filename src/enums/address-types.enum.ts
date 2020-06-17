import { registerEnumType } from 'type-graphql';

export enum AddressTypes {
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BOTH = 'BOTH',
}

registerEnumType(AddressTypes, {
  name: 'AddressTypes', // this one is mandatory
  description: 'The different types of addresses a customer can add',
});
