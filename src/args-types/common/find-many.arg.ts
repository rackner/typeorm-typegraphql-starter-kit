import { Field, ArgsType, Int } from 'type-graphql';
import { Min, Max } from 'class-validator';

@ArgsType()
export class FindManyArgs {
  @Field(type => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'The page you are searching for',
  })
  @Min(1)
  public page?: number = 1;

  @Field(type => Int, {
    nullable: true,
    defaultValue: 5,
    description: 'Number of items per page',
  })
  @Min(1)
  @Max(100)
  public perPage: number = 5;
}
