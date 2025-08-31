import { Injectable } from '@nestjs/common'
import { EndpointRepository } from './endpoint.repository'
import { EndpointEntity } from './entities/endpoint.entity'
import { CreateEndpointDto } from './dtos/create-endpoint.dto'
import { UpdateEndpointDto } from './dtos/update-endpoint.dto'
import { QueryEndpointDto } from './dtos/query-endpoint.dto'

@Injectable()
export class EndpointService {
  constructor(private readonly repo: EndpointRepository) {}

  create(dto: CreateEndpointDto): Promise<EndpointEntity> {
    return this.repo.create(dto)
  }

  findAll(): Promise<EndpointEntity[]> {
    return this.repo.findAll()
  }

  findOne(id: string): Promise<EndpointEntity> {
    return this.repo.findById(id)
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
