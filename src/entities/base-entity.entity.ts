import { ObjectType, GraphQLTimestamp, ID, Field } from 'type-graphql';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType({
  description:
    'Base database entity that all other database entities extend from',
})
export abstract class BaseEntity {
  @Field(type => ID, { description: 'Unique ID of the instance' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field(type => GraphQLTimestamp, {
    description: 'Timestamp of when instance was created',
  })
  @CreateDateColumn()
  public createdAt?: Date;

  @Field(type => GraphQLTimestamp, {
    description: 'Timestamp of when instance was last updated',
  })
  @UpdateDateColumn()
  public updatedAt?: Date;
}
