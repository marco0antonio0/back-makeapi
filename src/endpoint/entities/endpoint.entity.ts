import { ApiProperty } from '@nestjs/swagger'
import { EndpointFieldDto } from '../dtos/endpoint-field.dto'

export class EndpointEntity {
  @ApiProperty({ example: 'abc123' })
  id!: string

  @ApiProperty({ example: 'Posts do Blog' })
  title!: string

  @ApiProperty({ type: [EndpointFieldDto] })
  campos!: EndpointFieldDto[]

  @ApiProperty({ example: '2025-08-31T10:00:00.000Z' })
  createdAt!: string

  @ApiProperty({ example: '2025-08-31T10:00:00.000Z' })
  updatedAt!: string
}
