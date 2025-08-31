import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  addDoc, collection, deleteDoc, doc, FieldPath, FieldValue, Firestore,
  getDoc, getDocs, limit as fsLimit, query, QueryConstraint, serverTimestamp,
  Timestamp, updateDoc, WithFieldValue, where,
} from 'firebase/firestore'
import { FIREBASE_DB } from 'src/firebase/firebase.tokens'
import { ItemEntity } from './entities/item.entity'
import { QueryItemDto } from './dtos/query-item.dto'

type ItemDocRead = {
  endpointId: string
  data: Record<string, any>
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

type ItemDocWrite = {
  endpointId: string
  data: Record<string, any>
  createdAt: FieldValue
  updatedAt: FieldValue
}

function tsToIso(v: Timestamp | null | undefined): string {
  return v ? v.toDate().toISOString() : ''
}

@Injectable()
export class ItensRepository {
  private readonly colRef
  constructor(@Inject(FIREBASE_DB) private readonly db: Firestore) {
    this.colRef = collection(this.db, 'itens')
  }

  private map(id: string, data: ItemDocRead): ItemEntity {
    return {
      id,
      endpointId: data.endpointId,
      data: data.data ?? {},
      createdAt: tsToIso(data.createdAt),
      updatedAt: tsToIso(data.updatedAt),
    }
  }

  // ---------- CRUD básico (inalterado) ----------
  async create(input: { endpointId: string; data: Record<string, any> }): Promise<ItemEntity> {
    const payload: WithFieldValue<ItemDocWrite> = {
      endpointId: input.endpointId,
      data: input.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const ref = await addDoc(this.colRef, payload)
    const snap = await getDoc(ref)
    return this.map(snap.id, snap.data() as ItemDocRead)
  }

  async findAll(params?: { endpointId?: string; limit?: number }): Promise<ItemEntity[]> {
    const constraints: QueryConstraint[] = []
    if (params?.endpointId) constraints.push(where('endpointId', '==', params.endpointId))
    if (params?.limit && params.limit > 0) constraints.push(fsLimit(params.limit))
    const q = query(this.colRef, ...constraints)
    const snaps = await getDocs(q)
    return snaps.docs.map((d) => this.map(d.id, d.data() as ItemDocRead))
  }

  async findById(id: string): Promise<ItemEntity> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Item não encontrado')
    return this.map(snap.id, snap.data() as ItemDocRead)
  }

  async update(id: string, patch: { data?: Record<string, any> }): Promise<ItemEntity> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Item não encontrado')
    await updateDoc(ref, {
      ...(patch.data ? { data: patch.data } : {}),
      updatedAt: serverTimestamp(),
    } as Partial<ItemDocWrite>)
    const updated = await getDoc(ref)
    return this.map(updated.id, updated.data() as ItemDocRead)
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.colRef, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new NotFoundException('Item não encontrado')
    await deleteDoc(ref)
  }

  // ---------- Query avançada (igual à do endpoint, sem orderBy) ----------

  // campos de data que devem ser coeridos para Timestamp quando usados nos filtros
  private static readonly TS_FIELDS = new Set(['createdAt', 'updatedAt'])

  private isIsoDateString(v: unknown): v is string {
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)
  }

  private coerceValue(field: string, value: unknown): unknown {
    if (ItensRepository.TS_FIELDS.has(field)) {
      if (value instanceof Timestamp) return value
      if (this.isIsoDateString(value)) return Timestamp.fromDate(new Date(value))
      if (typeof value === 'number') return Timestamp.fromMillis(value)
    }
    return value
  }

  private coerceArray(field: string, value: unknown): unknown[] {
    const arr = Array.isArray(value) ? value : []
    return arr.map((v) => this.coerceValue(field, v))
  }

  // converte "data.Título" para FieldPath, para suportar espaços/acentos no subcampo
  private toFieldPath(field: string): string | FieldPath {
    if (!field) return field
    const segs = field.split('.')
    if (segs.length === 1) return field
    return new FieldPath(...segs)
  }

  // helpers case-insensitive (aplicados pós-query quando necessário)
  private eqCI(a: unknown, b: unknown): boolean {
    if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase()
    return a === b
  }
  private includesCI(hay: unknown[], needle: unknown): boolean {
    if (!Array.isArray(hay)) return false
    if (typeof needle === 'string') return hay.some((x) => typeof x === 'string' && x.toLowerCase() === needle.toLowerCase())
    return hay.some((x) => x === needle)
  }
  private anyIntersectCI(hay: unknown[], needles: unknown[]): boolean {
    if (!Array.isArray(hay) || !Array.isArray(needles)) return false
    const hStr = new Set(hay.filter((x) => typeof x === 'string').map((x: any) => x.toLowerCase()))
    const hOther = new Set(hay.filter((x) => typeof x !== 'string'))
    for (const n of needles) {
      if (typeof n === 'string') { if (hStr.has(n.toLowerCase())) return true }
      else { if (hOther.has(n)) return true }
    }
    return false
  }
  private getDeep(obj: any, path: string): any {
    if (!obj) return undefined
    return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj)
  }
  private applyPostFilterCI(docData: any, f: { field: string; op: string; value: any }): boolean {
    const fieldVal = this.getDeep(docData, f.field)
    switch (f.op) {
      case '==':        return this.eqCI(fieldVal, f.value)
      case 'in':        return (Array.isArray(f.value) ? f.value : []).some((v) => this.eqCI(fieldVal, v))
      case 'not-in':    return !(Array.isArray(f.value) ? f.value : []).some((v) => this.eqCI(fieldVal, v))
      case 'array-contains':       return this.includesCI(fieldVal as any[], f.value)
      case 'array-contains-any':   return this.anyIntersectCI(fieldVal as any[], Array.isArray(f.value) ? f.value : [])
      default: return true // outros ops (<, <=, >, >=) ficaram no Firestore
    }
  }

  /**
   * Consulta avançada (SEM orderBy) com filtros e limit.
   * - Strings em '==', 'in', 'not-in', 'array-contains', 'array-contains-any'
   *   são case-insensitive (aplicadas pós-query em memória).
   * - Campos 'createdAt'/'updatedAt' aceitam ISO string ou millis.
   *
   * Ex.:
   * POST /itens/query
   * {
   *   "filters":[
   *     {"field":"endpointId","op":"==","value":"mFWK2QPNpMyQIDuojj2V"},
   *     {"field":"data.Título","op":"==","value":"meu post"}
   *   ],
   *   "limit": 20
   * }
   */
  async queryWithFilters(dto: QueryItemDto): Promise<ItemEntity[]> {
    const firestoreConstraints: QueryConstraint[] = []
    const postFilters: Array<{ field: string; op: string; value: any }> = []

    for (const f of dto.filters ?? []) {
      const isStringLike = typeof f.value === 'string' ||
        (Array.isArray(f.value) && f.value.every((v) => typeof v === 'string'))
      const needsCI = isStringLike && (f.op === '==' || f.op === 'in' || f.op === 'not-in' || f.op === 'array-contains' || f.op === 'array-contains-any')

      if (needsCI) {
        postFilters.push({ field: f.field, op: f.op as string, value: f.value })
        continue
      }

      let val: unknown = f.value
      if (f.op === 'in' || f.op === 'array-contains-any' || f.op === 'not-in') val = this.coerceArray(f.field, val)
      else val = this.coerceValue(f.field, val)

      const fp = this.toFieldPath(f.field)
      firestoreConstraints.push(where(fp as any, f.op as any, val as any))
    }

    if (dto.limit && dto.limit > 0 && postFilters.length === 0) {
      firestoreConstraints.push(fsLimit(dto.limit))
    }

    const q = query(this.colRef, ...firestoreConstraints)
    const snaps = await getDocs(q)

    let rows = snaps.docs.map((d) => ({ id: d.id, data: d.data() as ItemDocRead }))
    if (postFilters.length > 0) {
      rows = rows.filter((r) => postFilters.every((pf) => this.applyPostFilterCI(r.data, pf)))
    }

    if (dto.limit && dto.limit > 0 && postFilters.length > 0) {
      rows = rows.slice(0, dto.limit)
    }

    return rows.map((r) => this.map(r.id, r.data))
  }
}
