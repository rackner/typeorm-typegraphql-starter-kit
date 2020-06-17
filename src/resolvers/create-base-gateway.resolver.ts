import { Resolver, Query, Args, ClassType, Authorized } from 'type-graphql';
import { Repository, getRepository } from 'typeorm';
import { FindOneArgs, FindManyArgs } from '../args-types';
import { UserRoleTypes } from '../enums';
import { getOne, getMany } from '../utilities';
import { ApolloError } from 'apollo-server-express';
import pluralize = require('pluralize');

export const createBaseGateway = <T extends ClassType>(
  Entity: T,
  name: string,
) => {
  @Resolver({ isAbstract: true })
  abstract class BaseResolver {
    protected repo: Repository<T> = getRepository(Entity);

    @Query(returns => Entity, {
      name: `get${name.split(' ').join('')}`,
      description: `Return one ${name.toLowerCase()}`,
    })
    async getOne(@Args() findOneArgs: FindOneArgs): Promise<T> {
      const entity: T = await getOne(findOneArgs, this.repo);

      if (!entity)
        throw new ApolloError(
          `${name} ${findOneArgs.attribute} ${findOneArgs.value} not found`,
          'NOT_FOUND',
        );

      return entity;
    }

    // NOTE: When we need to get more complicated than just returning a list of users
    // https://typegraphql.com/docs/generic-types.html
    @Query(returns => [Entity], {
      name: `get${pluralize(name.split(' ').join(''))}`,
      description: `Return a list of ${pluralize(name).toLowerCase()}`,
    })
    @Authorized(UserRoleTypes.SUPER_ADMIN)
    async getMany(@Args() findManyArgs: FindManyArgs): Promise<T[]> {
      return await getMany(findManyArgs, this.repo);
    }
  }

  return BaseResolver;
};
