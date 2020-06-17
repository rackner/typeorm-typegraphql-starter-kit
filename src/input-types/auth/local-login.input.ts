import { ArgsType, Field } from 'type-graphql';
import { Length, IsEmail, IsString, MaxLength } from 'class-validator';

@ArgsType()
export class LocalLoginInput {
  @Field({ description: 'Email address of the user trying to login' })
  @IsEmail()
  @MaxLength(50)
  public emailAddress: string;

  @Field({ description: 'Password of the user trying to login' })
  @IsString()
  @Length(6, 100)
  public password: string;
}
