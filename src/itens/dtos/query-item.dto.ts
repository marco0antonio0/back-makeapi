import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Allow, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export const FIRESTORE_OPS = [
  '==',
  '<', '<=', '>', '>=',
  'array-contains',
  'array-contains-any',
  'in', 'not-in',
] as const
export type FirestoreOp = typeof FIRESTORE_OPS[number]

export class FilterDto {
  @ApiProperty({ example: 'endpointId' /* ou "data.Título" */ })
  @IsString()
  field!: string

  @ApiProperty({ enum: FIRESTORE_OPS, example: '==' })
  @IsString()
  op!: FirestoreOp

  @ApiProperty({ description: 'Qualquer JSON serializável' })
  @Allow()
  value!: unknown
}

export class QueryItemDto {
  @ApiProperty({ type: [FilterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters!: FilterDto[]

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number
}
