import { Injectable } from '@nestjs/common'
import { ItensRepository } from './itens.repository'
import { CreateItemDto } from './dtos/create-item.dto'
import { UpdateItemDto } from './dtos/update-item.dto'
import { ListItemsQueryDto } from './dtos/list-query.dto'
import { QueryItemDto } from './dtos/query-item.dto'
import { ItemEntity } from './entities/item.entity'

@Injectable()
export class ItensService {
  constructor(private readonly repo: ItensRepository) {}

  create(dto: CreateItemDto): Promise<ItemEntity> {
    return this.repo.create({ endpointId: dto.endpointId, data: dto.values })
  }
  findAll(query: ListItemsQueryDto): Promise<ItemEntity[]> {
    return this.repo.findAll({ endpointId: query.endpointId, limit: query.limit })
  }
  findOne(id: string): Promise<ItemEntity> {
    return this.repo.findById(id)
  }
  update(id: string, dto: UpdateItemDto): Promise<ItemEntity> {
    return this.repo.update(id, { data: dto.values })
  }
  remove(id: string): Promise<void> {
    return this.repo.delete(id)
  }

  // 🔎 novo
  query(dto: QueryItemDto): Promise<ItemEntity[]> {
    return this.repo.queryWithFilters(dto)
  }
}
