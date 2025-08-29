// dtos/change-password.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'novaSenha123' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'novaSenha123' })
  @IsString()
  confirmNewPassword: string;
}
