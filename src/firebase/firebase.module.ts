import { Module } from '@nestjs/common';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_APP, FIREBASE_DB } from './firebase.tokens';

@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: () => {
        if (!getApps().length) {
          const {
            FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID,
            FIREBASE_APP_ID,
            FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_STORAGE_BUCKET,
          } = process.env;

          const config = {
            apiKey: FIREBASE_API_KEY,
            authDomain: FIREBASE_AUTH_DOMAIN,
            projectId: FIREBASE_PROJECT_ID,
            appId: FIREBASE_APP_ID,
            messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
            storageBucket: FIREBASE_STORAGE_BUCKET,
          };

          return initializeApp(config);
        }
        return getApps()[0]!;
      },
    },
    {
      provide: FIREBASE_DB,
      useFactory: (app) => getFirestore(app),
      inject: [FIREBASE_APP],
    },
  ],
  exports: [FIREBASE_APP, FIREBASE_DB],
})
export class FirebaseModule {}
