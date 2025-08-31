import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsString, MaxLength } from 'class-validator'

export enum EndpointFieldTipo {
  STRING = 'string',
  NUMBER = 'number',
  IMAGE  = 'image',
}

export class EndpointFieldDto {
  @ApiProperty({ example: 'Título' })
  @IsString()
  @MaxLength(80)
  title!: string

  @ApiProperty({ enum: EndpointFieldTipo, example: EndpointFieldTipo.STRING })
  @IsEnum(EndpointFieldTipo)
  tipo!: EndpointFieldTipo

  @ApiProperty({ description: 'true = multilinha, false = linha única', example: false })
  @IsBoolean()
  mult!: boolean
}
