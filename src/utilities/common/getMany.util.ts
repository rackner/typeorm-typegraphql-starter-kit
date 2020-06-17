import { FindManyArgs } from '../../args-types';

export const getMany = async (
  { page = 1, perPage = 5 }: FindManyArgs,
  repo: any,
): Promise<any[]> => {
  return await repo
    .createQueryBuilder('entity')
    .take(perPage)
    .offset(perPage * page - perPage)
    .getMany();
};
