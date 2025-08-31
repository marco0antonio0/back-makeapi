import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { EndpointService } from './endpoint.service'
import { EndpointEntity } from './entities/endpoint.entity'
import { CreateEndpointDto } from './dtos/create-endpoint.dto'
import { UpdateEndpointDto } from './dtos/update-endpoint.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { QueryEndpointDto } from './dtos/query-endpoint.dto'

@ApiTags('Endpoints')
@Controller('endpoint')
export class EndpointController {
  constructor(private readonly service: EndpointService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Criar um endpoint' })
  @ApiCreatedResponse({ type: EndpointEntity })
  @ApiBadRequestResponse({ description: 'Payload inválido' })
  create(@Body() dto: CreateEndpointDto): Promise<EndpointEntity> {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar endpoints' })
  @ApiOkResponse({ type: [EndpointEntity] })
  findAll(): Promise<EndpointEntity[]> {
    return this.service.findAll()
    }
    
  @Get(':id')
  @ApiOperation({ summary: 'Buscar endpoint por ID' })
  @ApiOkResponse({ type: EndpointEntity })
  @ApiNotFoundResponse({ description: 'Endpoint não encontrado' })
  findOne(@Param('id') id: string): Promise<EndpointEntity> {
    return this.service.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um endpoint' })
  @ApiOkResponse({ type: EndpointEntity })
  @ApiBadRequestResponse({ description: 'Payload inválido' })
  @ApiNotFoundResponse({ description: 'Endpoint não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateEndpointDto): Promise<EndpointEntity> {
    return this.service.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um endpoint' })
  @ApiOkResponse({ description: 'Removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Endpoint não encontrado' })
  async remove(@Param('id') id: string): Promise<{ ok: true }> {
    await this.service.remove(id)
    return { ok: true }
    }
    
  @Post('query')
  @ApiOperation({ summary: 'Consultar endpoints por filtros' })
  @ApiOkResponse({ type: [EndpointEntity] })
  @ApiBadRequestResponse({ description: 'Payload inválido' })
  query(@Body() dto: QueryEndpointDto): Promise<EndpointEntity[]> {
    return this.service.query(dto)
  }
}
