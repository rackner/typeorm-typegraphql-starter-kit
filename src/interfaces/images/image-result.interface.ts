import { ObjectType, Field } from 'type-graphql';
import { Image } from '../../entities';
import GraphQLJSON from 'graphql-type-json';

@ObjectType({
  description: 'Represents an image of items menu',
})
export class ImageResult implements Partial<Image> {
  @Field({ description: 'URL in order to access image at' })
  public url: string;

  @Field({ description: 'Caption to display on the image', nullable: true })
  public caption?: string;

  @Field({ description: 'Name of the image', nullable: true })
  public name?: string;
}
