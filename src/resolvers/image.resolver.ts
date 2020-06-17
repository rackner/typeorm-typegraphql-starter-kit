import { InjectRepository } from 'typeorm-typedi-extensions';
import { Inject } from 'typedi';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Image, User } from '../entities';
import { ImageRepository } from '../repositories';
import { addImage, deleteImage } from '../utilities';
import { createBaseGateway } from '../resolvers';
import { ImageTypes } from '../enums';
import { S3Service } from '../services';
import { Resolver, Arg, ID, Mutation } from 'type-graphql';

const ImageBaseGateway = createBaseGateway(Image, 'Image');

@Resolver()
export class ImageGateways extends ImageBaseGateway {
  @InjectRepository(ImageRepository)
  private readonly imageRepo: ImageRepository;
  @Inject()
  private readonly s3Service: S3Service;

  @Mutation(returns => Image, {
    description: 'Add an image to either a user, item, or business',
  })
  async addImage(
    @Arg('image', type => GraphQLUpload, { validate: false })
    imgPromise: FileUpload,
    @Arg('active', { defaultValue: true }) active: boolean,
    @Arg('type', type => ImageTypes) type: ImageTypes,
    @Arg('parentId', type => ID) parentId: string,
  ): Promise<Image> {
    const image = await imgPromise;
    return await addImage({
      image,
      active,
      type,
      parentId,
      imageRepo: this.imageRepo,
      s3Service: this.s3Service,
    });
  }

  @Mutation(returns => String, {
    description: 'Delete an existing image, leaving its user intact',
  })
  async deleteImage(@Arg('id', type => ID) id: string): Promise<String> {
    return await deleteImage(id, this.getOne.bind(this), this.imageRepo);
  }
}
