import { ObjectType, Field } from 'type-graphql';

/*
The access token has a short expiry of two-hours and if still valid we send
that request straight through to the resolver (with access token) instead of querying
our user table. The refresh token has a longer expiry of 14 days and at this point,
we check the user is still valid in our database and that will generate
new tokens for the session.
*/

@ObjectType({
  description:
    'Contains the authentication tokens required to authenticate with the Cuzi API',
})
export class AuthTokens {
  @Field({ description: 'Access token for JTW authentication' })
  public accessToken: string;

  @Field({ description: 'Refresh token for JWT authentication' })
  public refreshToken: string;
}
