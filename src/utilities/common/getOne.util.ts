import { FindOneArgs } from '../../args-types';

export const getOne = async (
  { value, attribute = 'id', relations = [], select }: FindOneArgs,
  repo: any,
): Promise<any> => {
  // Retrieve by id
  const now = Date.now();
  const query = repo
    .createQueryBuilder('entity')
    .where(`entity.${attribute} = :value${now}`, { [`value${now}`]: value });

  if (!!select?.length) {
    if (select.some(attr => attr.includes('*'))) {
      select =
        select.flatMap(attr => {
          if (!attr.includes('*')) return attr;

          return repo.metadata.ownColumns
            .filter(({ isSelect }) => !!isSelect)
            .map(({ propertyName }) => propertyName);
        }) ?? [];
    }

    query.select(select.map(attr => getAttrName(attr)));
  }

  relations.forEach(({ relation, name, conditional }) => {
    const now = Date.now();
    if (!!conditional) {
      query.leftJoinAndSelect(
        relation,
        name,
        `${name}.${conditional.attribute || 'id'} = :value${now}`,
        { [`value${now}`]: conditional.value },
      );
    } else {
      query.leftJoinAndSelect(relation, name);
    }
  });

  return await query.getOne();
};

const getAttrName = attr => {
  let rootEntity;
  if (attr.includes('.')) rootEntity = attr.split('.')[0];

  return !!rootEntity ? `${rootEntity}.${attr}` : `entity.${attr}`;
};
