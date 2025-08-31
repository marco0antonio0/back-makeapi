import { ApiProperty } from '@nestjs/swagger'
import { EndpointEntity } from './endpoint.entity'
import { ItemEntity } from 'src/itens/entities/item.entity'

export class EndpointWithItemsEntity extends EndpointEntity {
  @ApiProperty({ type: () => [ItemEntity] })
  items!: ItemEntity[]
}
