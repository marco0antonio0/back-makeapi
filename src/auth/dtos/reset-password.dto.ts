import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'A1B2C3' })
  @IsString()
  code!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  confirmNewPassword!: string;
}
