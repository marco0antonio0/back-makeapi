import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'usuario123' })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({ example: 'SenhaForte123' })
  @IsString()
  @MinLength(6)
  password!: string;
}