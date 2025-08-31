import { Injectable } from '@nestjs/common'
import { EndpointRepository } from './endpoint.repository'
import { EndpointEntity } from './entities/endpoint.entity'
import { CreateEndpointDto } from './dtos/create-endpoint.dto'
import { UpdateEndpointDto } from './dtos/update-endpoint.dto'
import { QueryEndpointDto } from './dtos/query-endpoint.dto'
import { EndpointWithItemsEntity } from './entities/endpoint-with-items.entity'
import { ItensRepository } from 'src/itens/itens.repository'

@Injectable()
export class EndpointService {
  constructor(private readonly repo: EndpointRepository,
              private readonly itensRepo: ItensRepository) {}

  create(dto: CreateEndpointDto): Promise<EndpointEntity> {
    return this.repo.create(dto)
  }

  findAll(): Promise<EndpointEntity[]> {
    return this.repo.findAll()
  }

  async findOne(id: string): Promise<EndpointWithItemsEntity> {
    const endpoint = await this.repo.findById(id)
    const items = await this.itensRepo.findAll({ endpointId: id })
    return { ...endpoint, items }
  }

  update(id: string, dto: UpdateEndpointDto): Promise<EndpointEntity> {
    return this.repo.update(id, dto)
  }

  remove(id: string): Promise<void> {
    return this.repo.delete(id)
    }
    
  query(dto: QueryEndpointDto) {
    return this.repo.queryWithFilters(dto)
  }
}
