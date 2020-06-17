import { Context } from '../interfaces';
import { createParamDecorator } from 'type-graphql';

export const CurrentUser = () =>
  createParamDecorator<Context>(({ context }) => context.user);
