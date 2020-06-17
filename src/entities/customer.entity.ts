import { BaseEntity } from './base-entity.entity';
import { User } from './user.entity';
import { Address } from './address.entity';
import { ObjectType, Field } from 'type-graphql';
import { Column, Entity, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
@ObjectType({
  description: 'Customer entity. Interacts with cuzi-customer frontend',
})
export class Customer extends BaseEntity {
  @Column({
    type: 'boolean',
    default: false,
    insert: false,
  })
  @Field(type => Boolean, {
    defaultValue: false,
    description:
      'Flag describing whether user has deleted their customer profile',
  })
  public deleted: boolean;

  @OneToOne(type => User, user => user.customer, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  public user: User;

  @OneToMany(type => Address, address => address.customer)
  public addresses: Address[];

  constructor(
    partial: Partial<Customer>,
    constructOption?: 'create' | 'update',
  ) {
    super();

    Object.assign(this, partial);

    if (!!constructOption && ['create', 'update'].includes(constructOption)) {
      delete this.createdAt;
      delete this.updatedAt;

      if (constructOption === 'create') delete this.id;
    }
  }
}
