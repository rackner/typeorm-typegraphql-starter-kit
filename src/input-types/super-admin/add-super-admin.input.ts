import { InputType, Field } from 'type-graphql';
import { User } from '../../entities';
import { IsEmail, MinLength, IsPhoneNumber } from 'class-validator';

@InputType({ description: "Create a super admin and it's underlying user" })
export class AddSuperAdminInput
  implements Partial<User & { password?: string }> {
  @Field({ description: 'Email address of the super admin to be created' })
  @IsEmail()
  public emailAddress: string;

  @Field({ description: 'Password for the user to login with', nullable: true })
  public password?: string;

  @Field({ description: 'First name of the super admin', nullable: true })
  @MinLength(1)
  public firstName?: string;

  @Field({ description: 'Last name of the super admin', nullable: true })
  @MinLength(1)
  public lastName?: string;

  @Field({ description: 'Phone number of the super admin', nullable: true })
  @IsPhoneNumber('US')
  public phoneNumber?: string;
}
