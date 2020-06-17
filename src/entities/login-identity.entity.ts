import { BaseEntity } from './base-entity.entity';
import { User } from './user.entity';
import { LoginIdentityTypes } from '../enums';
import { generateSalt, hashPassword, compareToHash } from '../utilities';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  getRepository,
} from 'typeorm';

// NOTE: this class does not need to be tagged with type-graphql decorators because
// frontend components should not interact with LoginIdentities directly (instead should interact with user)
@Entity()
export class LoginIdentity extends BaseEntity {
  // Null for local login
  @Column({ nullable: true, update: false })
  public externalId: string;

  // Null for non-local login
  @Column({ select: false, nullable: true })
  public password?: string;

  @Column({ select: false, nullable: true })
  public salt?: string;

  // Local, facebook, or google
  @Column({ type: 'enum', enum: LoginIdentityTypes, update: false })
  public type: LoginIdentityTypes;

  @ManyToOne(type => User, user => user.loginIdentities, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  public user: User;

  constructor(
    partial: Partial<LoginIdentity>,
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

  /* Before insert, if local identity, hash password */
  @BeforeInsert()
  public encrypt(): void | Promise<string> {
    // If it's not a user that has FB or Google Login
    if (this.type === LoginIdentityTypes.LOCAL && !!this.password)
      return (<Promise<string>>this.generateSalt()).then(() =>
        this.hashPassword(),
      );
  }

  public async isValidPassword(rawPassword: string): Promise<boolean> {
    let hashedPassword;
    if (!this.password) {
      const li = await getRepository(LoginIdentity)
        .createQueryBuilder('li')
        .select(['li.password'])
        .where('li.id = :id', { id: this.id })
        .getOne();

      if (!!li) {
        hashedPassword = li.password;
      } else {
        return false;
      }
    } else {
      hashedPassword = this.password;
    }

    return compareToHash(rawPassword, hashedPassword);
  }

  private generateSalt(): Promise<string> {
    return generateSalt().then((salt: string) => {
      return (this.salt = salt);
    });
  }

  private hashPassword(): any {
    if (!!this.password && !!this.salt)
      return hashPassword(this.password, this.salt).then((hash: string) => {
        return (this.password = hash);
      });
  }
}
