import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsString } from 'class-validator'

export class CreateItemDto {
  @ApiProperty({ example: 'mFWK2QPNpMyQIDuojj2V' })
  @IsString()
  endpointId!: string

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      'Título': 'Meu primeiro post',
      'Descrição': 'Texto longo aqui...',
    },
  })
  @IsObject()
  values!: Record<string, any>
}