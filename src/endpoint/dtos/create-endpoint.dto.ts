import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsString, MaxLength, ValidateNested } from 'class-validator'
import { EndpointFieldDto } from './endpoint-field.dto'

export class CreateEndpointDto {
  @ApiProperty({ example: 'Posts do Blog' })
  @IsString()
  @MaxLength(120)
  title!: string

  @ApiProperty({
    type: [EndpointFieldDto],
    example: [
      { title: 'Título', tipo: 'string', mult: false },
      { title: 'Descrição', tipo: 'string', mult: true },
      { title: 'Capa', tipo: 'image',  mult: false },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EndpointFieldDto)
  campos!: EndpointFieldDto[]
}
