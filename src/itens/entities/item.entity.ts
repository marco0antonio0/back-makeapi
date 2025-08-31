import { ApiProperty } from '@nestjs/swagger'

export class ItemEntity {
  @ApiProperty()
  id!: string

  @ApiProperty()
  endpointId!: string

  @ApiProperty({ type: 'object', additionalProperties: true })
  data!: Record<string, any>

  @ApiProperty()
  createdAt!: string

  @ApiProperty()
  updatedAt!: string
}
