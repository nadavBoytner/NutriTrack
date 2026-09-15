import { IsString, MinLength } from 'class-validator';

export class AiParseDto {
  @IsString()
  @MinLength(1)
  text!: string;
}
