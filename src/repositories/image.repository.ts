import { Image, User } from '../entities';
import { ImageTypes } from '../enums';
import { LoadRelation, ImageResult } from '../interfaces';
import {
  EntityRepository,
  Repository,
  InsertResult,
  getConnection,
} from 'typeorm';

@EntityRepository(Image)
export class ImageRepository extends Repository<Image> {
  public async createOne(newImage: Image): Promise<Image> {
    const res: InsertResult = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values(newImage)
      .execute();

    return {
      ...res.raw[0],
      ...newImage,
    };
  }
}
