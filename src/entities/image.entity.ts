import { BaseEntity } from './base-entity.entity';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from './user.entity';
import { ImageTypes } from '../enums';
import { Column, Entity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@ObjectType({
  description:
    'Image entity. Used to store images on users, businesses, and items',
})
export class Image extends BaseEntity {
  @Field({ description: 'Whether or not image is active.' })
  @Column({ type: 'boolean', default: true, insert: false })
  public active: boolean;

  @Field(type => Boolean, {
    description:
      'Whether or not the image has been currently deleted by an admin.',
  })
  @Column({ type: 'boolean', default: false })
  public deleted: boolean;

  @Field(type => ID, { description: 'ID of the item on the pos system' })
  @Column({ update: false, unique: true })
  public externalId: string;

  @Field({ description: 'Caption to display on the image', nullable: true })
  @Column({ type: 'text', nullable: true })
  public caption?: string;

  @Field({ description: 'S3 URL where the image can be found', nullable: true })
  @Column({ nullable: true })
  public url?: string;

  @Field({
    description: 'URL provided by POS system, where image can be found',
    nullable: true,
  })
  @Column({ nullable: true })
  public publicUrl?: string;

  @Field({ description: 'Name of the file' })
  @Column()
  public filename: string;

  @Field(type => ImageTypes, {
    description: 'Image type. Corresponds to what the parent of the image is',
  })
  @Column({ type: 'enum', enum: ImageTypes, update: false })
  public type: ImageTypes;

  @OneToOne(type => User, user => user.image, { onDelete: 'CASCADE' })
  @JoinColumn()
  public user: User;

  constructor(partial: Partial<Image>, constructOption?: 'create' | 'update') {
    super();

    Object.assign(this, partial);

    if (!!constructOption && ['create', 'update'].includes(constructOption)) {
      delete this.createdAt;
      delete this.updatedAt;

      if (constructOption === 'create') delete this.id;
    }
  }
}
