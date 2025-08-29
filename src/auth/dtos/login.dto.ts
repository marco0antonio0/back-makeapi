// dtos/login.dto.ts
import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsStrongPassword({
    minLength: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minLowercase: 0,
  })
  password: string;
}
