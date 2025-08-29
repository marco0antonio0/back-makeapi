import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterConfirmDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'A1B2C3' })
  @IsString()
  @MinLength(4)
  code!: string;
}