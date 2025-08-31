import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional } from 'class-validator'

export class UpdateItemDto {
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: {
      'Título': 'Novo título',
    },
  })
  @IsOptional()
  @IsObject()
  values?: Record<string, any>
}