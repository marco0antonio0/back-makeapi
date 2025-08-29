// dtos/register.dto.ts
import { IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'nomeusuario' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'senha123' })
  @IsStrongPassword({
    minLength: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minLowercase: 0,
  })
  password: string;

  @ApiPropertyOptional({ example: 1, description: 'Padrão é 1' })
  @IsNumber()
  @IsOptional()
  role?: number;
}
