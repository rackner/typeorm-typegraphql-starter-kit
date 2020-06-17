import { InjectRepository } from 'typeorm-typedi-extensions';
import { LocalLoginInput } from '../input-types';
import { LoginResult } from '../interfaces';
import { UserRepository } from '../repositories';
import { loginLocally } from '../utilities';
import { Resolver, Args, Query } from 'type-graphql';

@Resolver()
export class AuthGateway {
  @InjectRepository(UserRepository)
  private readonly userRepo: UserRepository;

  @Query(returns => LoginResult, {
    description: 'Use email and address to get tokens to login to frontend',
  })
  async loginLocally(
    @Args() localLoginInput: LocalLoginInput,
  ): Promise<LoginResult> {
    return await loginLocally(localLoginInput, this.userRepo);
  }
}
