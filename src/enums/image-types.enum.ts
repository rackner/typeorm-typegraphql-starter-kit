import { registerEnumType } from 'type-graphql';

export enum ImageTypes {
  USER = 'USER',
}

registerEnumType(ImageTypes, {
  name: 'ImageTypes', // this one is mandatory
  description: 'The types of images allowed in cuzi apps',
});
