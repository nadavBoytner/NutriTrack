import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
