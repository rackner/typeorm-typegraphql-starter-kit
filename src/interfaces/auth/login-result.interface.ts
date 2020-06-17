import { Field, ObjectType } from 'type-graphql';
import { AuthTokens } from '..';
import { User } from '../../entities';

@ObjectType({
  description:
    'Contains the user, any admin, customer, or super admin the user owns. As well as auth tokens.',
})
export class LoginResult {
  @Field(type => AuthTokens, {
    description:
      'Contains a access and refresh token in order to access the cuzi API as an authenticated user',
  })
  public tokens: AuthTokens;

  @Field(type => User, {
    description: 'Contains the user and relations the tokens are pertaining to',
  })
  public user: User;
}
