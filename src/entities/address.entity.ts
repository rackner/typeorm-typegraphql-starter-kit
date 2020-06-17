import { BaseEntity } from './base-entity.entity';
import { Customer } from './customer.entity';
import { AddressTypes } from '../enums';
import { ObjectType, Field } from 'type-graphql';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
@ObjectType({
  description: 'Address entity. Describes an address on an individual customer',
})
export class Address extends BaseEntity {
  @Field(type => AddressTypes, {
    description:
      'Type of the address. Corresponds to BILLING, SHIPPING, or BOTH',
    defaultValue: AddressTypes.BOTH,
  })
  @Column({
    type: 'enum',
    enum: AddressTypes,
    default: AddressTypes.BOTH,
    update: false,
  })
  public type: AddressTypes;

  @Field(type => Boolean, {
    description: 'Whether or not is an active billing or shipping address.',
  })
  @Column({ type: 'boolean', default: true, insert: false })
  public active: boolean;

  @Field({ description: 'Street address 1 of the location' })
  @Column()
  public address1: string;

  @Field({ description: 'Street address 2 of the location' })
  @Column()
  public address2: string;

  @Field({ description: 'City of the location' })
  @Column()
  public city: string;

  @Field({ description: 'State of the location' })
  @Column()
  public state: string;

  @Field({ description: 'Zip code of the location' })
  @Column()
  public zipCode: string;

  @Field({
    description: 'Two-letter country code of the location',
    defaultValue: 'US',
  })
  @Column({ default: 'US', update: false })
  public country: string;

  @ManyToOne(type => Customer, customer => customer.addresses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  public customer: Customer;

  constructor(
    partial: Partial<Address>,
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
