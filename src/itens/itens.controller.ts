import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ItensService } from './itens.service'
import { CreateItemDto } from './dtos/create-item.dto'
import { UpdateItemDto } from './dtos/update-item.dto'
import { ItemEntity } from './entities/item.entity'
import { ListItemsQueryDto } from './dtos/list-query.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { QueryItemDto } from './dtos/query-item.dto'

@ApiTags('itens')
@Controller('itens')
export class ItensController {
  constructor(private readonly service: ItensService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar item baseado no schema do Endpoint' })
  @ApiCreatedResponse({ type: ItemEntity })
  create(@Body() dto: CreateItemDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens (opcional: filtrar por endpointId)' })
  @ApiOkResponse({ type: [ItemEntity] })
  findAll(@Query() query: ListItemsQueryDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiOkResponse({ type: ItemEntity })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar item (revalida tipos contra o schema)' })
  @ApiOkResponse({ type: ItemEntity })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
    
  @Post('query')
  @ApiOperation({ summary: 'Consultar itens por filtros (sem orderBy)' })
  @ApiOkResponse({ type: [ItemEntity] })
  query(@Body() dto: QueryItemDto) { return this.service.query(dto) }
}
