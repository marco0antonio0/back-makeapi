import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { FIREBASE_DB } from 'src/firebase/firebase.tokens';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { RegisterDto } from './dtos/register.dto';

interface User {
  id: string;         
  username: string;
  email: string;
  password: string;   
  role?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UserRepository {
  private readonly colRef;

  constructor(@Inject(FIREBASE_DB) private readonly db: Firestore) {
    this.colRef = collection(this.db, 'users');
  }

  private mapSnapToUser(docSnap: any): User | null {
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    };
  }

  async findUser(email: string, _options: Record<string, any> = {}): Promise<User | null> {
    const q = query(this.colRef, where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return this.mapSnapToUser(snap.docs[0]);
  }

  async findUserByName(username: string, _options: Record<string, any> = {}): Promise<User | null> {
    const q = query(this.colRef, where('username', '==', username), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return this.mapSnapToUser(snap.docs[0]);
  }

  async createUser(data: RegisterDto): Promise<User> {
    const { username, email, password } = data;

    // (Opcional) reforçar unicidade
    const [emailQ, userQ] = await Promise.all([
      getDocs(query(this.colRef, where('email', '==', email), limit(1))),
      getDocs(query(this.colRef, where('username', '==', username), limit(1))),
    ]);
    if (!emailQ.empty) throw new Error('Email já cadastrado');
    if (!userQ.empty) throw new Error('Username já cadastrado');

    const docRef = await addDoc(this.colRef, {
      username,
      email,
      password, // RECOMENDADO: salve HASH aqui
      role: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const created = await getDoc(docRef);
    return this.mapSnapToUser(created)!;
  }

  async findUserById(id: string | number): Promise<User | null> {
    const ref = doc(this.db, 'users', String(id));
    const snap = await getDoc(ref);
    return this.mapSnapToUser(snap);
  }

  async updateUserPassword(userId: string | number, newPassword: string): Promise<User> {
    const ref = doc(this.db, 'users', String(userId));
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new NotFoundException('Usuário não encontrado');

    await updateDoc(ref, {
      password: newPassword, 
      updatedAt: serverTimestamp(),
    });

    const updated = await getDoc(ref);
    return this.mapSnapToUser(updated)!;
  }

  async updateUserRole(userId: string | number, newRole: number): Promise<User> {
    const ref = doc(this.db, 'users', String(userId));
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new NotFoundException('Usuário não encontrado');

    await updateDoc(ref, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    const updated = await getDoc(ref);
    return this.mapSnapToUser(updated)!;
  }
}
