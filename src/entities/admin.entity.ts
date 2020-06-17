import { BaseEntity } from './base-entity.entity';
import { User } from './user.entity';
import { ObjectType } from 'type-graphql';
import { Entity, OneToOne, JoinColumn } from 'typeorm';

@Entity()
@ObjectType({
  description: 'Admin entity. Interacts with the cuzi-business frontend',
})
export class Admin extends BaseEntity {
  @OneToOne(type => User, user => user.admin, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  public user: User;

  constructor(partial: Partial<Admin>, constructOption?: 'create' | 'update') {
    super();

    Object.assign(this, partial);

    if (!!constructOption && ['create', 'update'].includes(constructOption)) {
      delete this.createdAt;
      delete this.updatedAt;

      if (constructOption === 'create') delete this.id;
    }
  }
}
