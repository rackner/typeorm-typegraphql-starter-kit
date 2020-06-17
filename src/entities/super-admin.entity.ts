import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base-entity.entity';
import { User } from './user.entity';
import { ObjectType, Field } from 'type-graphql';

@Entity()
@ObjectType({
  description: 'Super admin entity. Used to interact with cuzi-admin frontend',
})
export class SuperAdmin extends BaseEntity {
  // TODO:
  // @OneToMany(type => Permission)
  // public permissions: Permission[];

  @OneToOne(type => User, user => user.superAdmin, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  public user: User;

  constructor(
    partial: Partial<SuperAdmin>,
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
