import { ImageRepository } from '../../repositories';
import { Image } from '../../entities';

// All delete image logic should go here
export const deleteImage = async (
  id: string,
  getImage,
  imageRepo: ImageRepository,
): Promise<String> => {
  const prevImage = await getImage({ value: id });

  await imageRepo.delete(id);

  return `Image id ${id} deleted successfully`;
};
