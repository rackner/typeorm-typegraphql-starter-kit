import { Field, ArgsType } from 'type-graphql';
import { FindOneRelation } from '../../interfaces';

@ArgsType()
export class FindOneArgs {
  @Field(type => String, {
    description:
      'The value of the attribute in which you are searching for. By default, this should be the unique ID of the entity you are searching for.',
  })
  public value: string | number;

  @Field({
    nullable: true,
    defaultValue: 'id',
    description:
      "The attribute in which you are searching for on the entity. By default, this is equal to 'id'",
  })
  public attribute?: string = 'id';

  public select?: string[];

  // Note. GraphQL should not be able to fetch relations.
  // This should be done through entity resolvers. This is more used for backend help
  public relations?: FindOneRelation[] = [];
}
