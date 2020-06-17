import { InputType, Field } from 'type-graphql';
import { User } from '../../entities';
import { IsEmail, MinLength, IsPhoneNumber } from 'class-validator';

@InputType({ description: 'Create a regular user' })
export class AddUserInput implements Partial<User & { password?: string }> {
  @Field({ description: 'Email address of the user to be created' })
  @IsEmail()
  public emailAddress: string;

  @Field({ description: 'Password for the user to login with', nullable: true })
  public password?: string;

  @Field({ description: 'First name of the user' })
  @MinLength(1)
  public firstName: string;

  @Field({ description: 'Phone number of the user', nullable: true })
  @IsPhoneNumber('US')
  public phoneNumber?: string;

  @Field({ description: 'Last name of the user' })
  @MinLength(1)
  public lastName: string;
}
