import { Inject, Injectable } from '@nestjs/common';
import { collection, Firestore } from 'firebase/firestore';
import { FIREBASE_DB } from 'src/firebase/firebase.tokens';

@Injectable()
export class EndpointRepository {

      private readonly colRef;
    
      constructor(@Inject(FIREBASE_DB) private readonly db: Firestore) {
        this.colRef = collection(this.db, 'endpoint');
      }
}
