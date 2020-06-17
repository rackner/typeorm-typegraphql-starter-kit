import { InputType, Field, ID } from 'type-graphql';
import { User, LoginIdentity } from '../../entities';
import { IsUUID, IsEmail, MinLength, IsPhoneNumber } from 'class-validator';

@InputType({ description: "Update a users' data" })
export class UpdateUserInput implements Partial<User> {
  @Field(type => ID, {
    description: 'ID of the user to be updated',
  })
  @IsUUID('4') // TypeORM uses UUID v4
  public id: string;

  @Field({
    nullable: true,
    description: 'Updated email address',
  })
  @IsEmail()
  public emailAddress?: string;

  @Field({ nullable: true, description: 'Updated first name' })
  @MinLength(1)
  public firstName?: string;

  @Field({ nullable: true, description: 'Updated last name' })
  @MinLength(1)
  public lastName?: string;

  @Field({ description: 'Phone number of the user', nullable: true })
  @IsPhoneNumber('US')
  public phoneNumber?: string;

  public loginIdentities?: LoginIdentity[];
}
