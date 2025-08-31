import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Allow, IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export const FIRESTORE_OPS = [
  '==',
  '<',
  '<=',
  '>',
  '>=',
  'array-contains',
  'array-contains-any',
  'in',
  'not-in',
] as const
export type FirestoreOp = typeof FIRESTORE_OPS[number]

export class FilterDto {
  @ApiProperty({ example: 'title', description: 'Caminho do campo (ex.: title / createdAt)' })
  @IsString()
  field!: string

  @ApiProperty({
    enum: FIRESTORE_OPS,
    example: '==',
    description: 'Operador do Firestore',
  })
  @IsIn(FIRESTORE_OPS as unknown as string[])
  op!: FirestoreOp

  @ApiProperty({
    example: 'Posts do Blog',
    description: 'Valor para comparação (qualquer JSON serializável)',
  })
  @Allow()
  value!: unknown
}

export class QueryEndpointDto {
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
