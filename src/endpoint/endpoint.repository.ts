import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FieldValue,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  WithFieldValue,
  UpdateData,
  QueryConstraint,
  where,
  orderBy as fsOrderBy,
  limit as fsLimit,
} from 'firebase/firestore'
import { FIREBASE_DB } from 'src/firebase/firebase.tokens'
import { CreateEndpointDto } from './dtos/create-endpoint.dto'
import { UpdateEndpointDto } from './dtos/update-endpoint.dto'
import { EndpointEntity } from './entities/endpoint.entity'
import { QueryEndpointDto } from './dtos/query-endpoint.dto'

function extractIndexUrlFromMessage(msg: string): string | null {
  const m = msg.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/)
  return m ? m[0] : null
}

function valueToComparable(v: any): number | string {
  if (v == null) return Number.NEGATIVE_INFINITY
  if (v?.toMillis && typeof v.toMillis === 'function') return v.toMillis() 
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return v
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return String(v) }
}

function sortByField<T extends { data: any }>(
  rows: T[],
  field: string,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  const dir = direction === 'desc' ? -1 : 1
  return rows.sort((a, b) => {
    const av = valueToComparable(a.data?.[field])
    const bv = valueToComparable(b.data?.[field])
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
}


type EndpointFieldPlain = {
  title: string
  tipo: 'string' | 'number' | 'image'
  mult: boolean
}

type EndpointDocRead = {
  title: string
  campos: EndpointFieldPlain[]
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

type EndpointDocWrite = {
  title: string
  campos: EndpointFieldPlain[]
  createdAt: FieldValue
  updatedAt: FieldValue
}

function tsToIso(v: Timestamp | null | undefined): string {
  return v ? v.toDate().toISOString() : ''
}

function toPlainFields(fields: unknown[]): EndpointFieldPlain[] {
  return (fields ?? []).map((f: any) => ({
    title: String(f?.title ?? ''),
    tipo: f?.tipo as 'string' | 'number' | 'image',
    mult: Boolean(f?.mult),
  }))
}

/** -------- Helpers de coerção para filtros -------- */
const TS_FIELDS = new Set(['createdAt', 'updatedAt'])
const RANGE_OPS = new Set(['<', '<=', '>', '>='])

function isIsoDateString(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)
}

function coerceValue(field: string, value: unknown): unknown {
  if (TS_FIELDS.has(field)) {
    if (value instanceof Timestamp) return value
    if (isIsoDateString(value)) return Timestamp.fromDate(new Date(value))
    if (typeof value === 'number') return Timestamp.fromMillis(value)
  }
  return value
}

function coerceArray(field: string, value: unknown): unknown[] {
  const arr = Array.isArray(value) ? value : []
  return arr.map((v) => coerceValue(field, v))
}

/** -------------------------------------------------- */

@Injectable()
export class EndpointRepository {
  private readonly colRef

  constructor(@Inject(FIREBASE_DB) private readonly db: Firestore) {
    this.colRef = collection(this.db, 'endpoint')
  }

  private map(id: string, data: EndpointDocRead): EndpointEntity {
    return {
      id,
      title: data.title,
      campos: (data.campos ?? []) as any[],
      createdAt: tsToIso(data.createdAt),
      updatedAt: tsToIso(data.updatedAt),
    }
  }
  /**
   * 🔎 Consultas com filtros (SEM orderBy no Firestore)
   *
   * ROTA:
   *   POST /endpoint/query
   *
   * SHAPE DO BODY:
   * {
   *   "filters": [
   *     { "field": "<campo>", "op": "<operador>", "value": <valor> }
   *   ],
   *   "limit": 20 // opcional
   * }
   *
   * OPERADORES SUPORTADOS:
   * - '==', '<', '<=', '>', '>='
   * - 'array-contains'
   * - 'array-contains-any' (value deve ser array com até 10 itens)
   * - 'in' / 'not-in'       (value deve ser array com até 10 itens)
   *
   * DICAS DE VALORES:
   * - Datas (createdAt / updatedAt):
   *   Envie ISO string (ex.: "2025-08-30T00:00:00.000Z") ou número em ms.
   *   O repositório converte automaticamente para Firestore Timestamp.
   *
   * - Arrays:
   *   • array-contains: value é UM elemento (primitivo ou objeto) que deve existir no array.
   *     Para arrays de objetos, o match é pelo OBJETO INTEIRO (mesma estrutura/valores).
   *   • array-contains-any / in / not-in: value é uma lista (até 10 itens).
   *
   * LIMITAÇÕES E ÍNDICES:
   * - Aqui não usamos orderBy no Firestore, então evitamos a maioria dos índices compostos.
   * - Ainda assim, combinações de filtros em campos diferentes podem exigir índice composto.
   *   Se acontecer, a API retorna 400 com um link direto para criar o índice.
   *
   * EXEMPLOS:
   * 1) Igualdade simples
   * {
   *   "filters": [
   *     { "field": "title", "op": "==", "value": "Posts do Blog" }
   *   ],
   *   "limit": 20
   * }
   *
   * 2) Por data (criados depois de 2025-08-30)
   * {
   *   "filters": [
   *     { "field": "createdAt", "op": ">=", "value": "2025-08-30T00:00:00.000Z" }
   *   ]
   * }
   *
   * 3) IN
   * {
   *   "filters": [
   *     { "field": "title", "op": "in", "value": ["Posts do Blog", "Produtos"] }
   *   ]
   * }
   *
   * 4) Array contains any (ex.: tags)
   * {
   *   "filters": [
   *     { "field": "tags", "op": "array-contains-any", "value": ["blog","news"] }
   *   ],
   *   "limit": 10
   * }
   *
   * 5) Combinação de filtros
   * {
   *   "filters": [
   *     { "field": "title", "op": "==", "value": "Posts do Blog" },
   *     { "field": "createdAt", "op": ">=", "value": "2025-08-30T00:00:00.000Z" }
   *   ]
   * }
   *
   * cURL (exemplo 1):
   * curl -X POST 'http://localhost:3000/endpoint/query' \
   *   -H 'Content-Type: application/json' \
   *   -d '{
   *     "filters": [
   *       { "field": "title", "op": "==", "value": "Posts do Blog" }
   *     ],
   *     "limit": 20
   *   }'
   */
  async queryWithFilters(dto: QueryEndpointDto): Promise<EndpointEntity[]> {
    const whereConstraints: QueryConstraint[] = []

    // apenas WHERE (sem orderBy no Firestore)
    for (const f of dto.filters ?? []) {
      let val: unknown = f.value
      if (f.op === 'in' || f.op === 'array-contains-any' || f.op === 'not-in') {
        val = coerceArray(f.field, val)
      } else {
        val = coerceValue(f.field, val)
      }
      whereConstraints.push(where(f.field as any, f.op as any, val as any))
    }

    const q = query(this.colRef, ...whereConstraints)
    const snaps = await getDocs(q)

    // prepara linhas pra ordenar/limitar localmente
    let rows = snaps.docs.map(d => ({ id: d.id, data: d.data() as EndpointDocRead }))

    // limit em memória (opcional)
    if (dto.limit && dto.limit > 0) {
      rows = rows.slice(0, dto.limit)
    }

    return rows.map(r => this.map(r.id, r.data))
  }

  async create(dto: CreateEndpointDto): Promise<EndpointEntity> {
    const payload: WithFieldValue<EndpointDocWrite> = {
      title: dto.title,
      // Normaliza para POJO antes de salvar:
      campos: toPlainFields(dto.campos as unknown[]),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const ref = await addDoc(this.colRef, payload)
    const snap = await getDoc(ref)
    return this.map(snap.id, snap.data() as EndpointDocRead)
  }

  async findAll(): Promise<EndpointEntity[]> {
    const q = query(this.colRef, orderBy('createdAt', 'desc'))
    const snaps = await getDocs(q)
    return snaps.docs.map((d) => this.map(d.id, d.data() as EndpointDocRead))
  }

  async findById(id: string): Promise<EndpointEntity> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Endpoint não encontrado')
    return this.map(snap.id, snap.data() as EndpointDocRead)
  }

  async update(id: string, dto: UpdateEndpointDto): Promise<EndpointEntity> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Endpoint não encontrado')

    const partial: UpdateData<EndpointDocWrite> = {
      updatedAt: serverTimestamp(),
    }

    if (dto.title !== undefined) (partial as any).title = dto.title
    if (dto.campos !== undefined) {
      // Também normaliza no update, se vier campos:
      (partial as any).campos = toPlainFields(dto.campos as unknown[])
    }

    await updateDoc(ref, partial)
    const updated = await getDoc(ref)
    return this.map(updated.id, updated.data() as EndpointDocRead)
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Endpoint não encontrado')
    await deleteDoc(ref)
  }
}
