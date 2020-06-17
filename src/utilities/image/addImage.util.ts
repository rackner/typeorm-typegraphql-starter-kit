import { ImageRepository } from '../../repositories';
import { Image, User } from '../../entities';
import { FileUpload } from 'graphql-upload';
import { ImageTypes } from '../../enums';
import { S3Service } from '../../services';
import { ApolloError } from 'apollo-server-express';

interface AddImageInput {
  image: FileUpload;
  active: boolean;
  type: ImageTypes;
  parentId: string;
  imageRepo: ImageRepository;
  s3Service: S3Service;
}

// All add image logic should go here
export const addImage = async ({
  image,
  active,
  type,
  parentId,
  imageRepo,
  s3Service,
}: AddImageInput): Promise<Image> => {
  image.filename = image.filename.replace(/[|&;$%@"<>()+,]/g, '');
  const s3Res = await s3Service.uploadFile(image, type.toLowerCase());

  const newImage = new Image({
    active,
    type,
    filename: image.filename,
    url: s3Res?.Location,
  });

  newImage[type.toLowerCase()] = constructParentType(parentId, type);

  return await imageRepo.createOne(newImage);
};

const constructParentType = (parentId: string, type: ImageTypes) => {
  switch (type) {
    case ImageTypes.USER:
      return new User({ id: parentId });
    default:
      throw new ApolloError('Parent type not found');
  }
};
