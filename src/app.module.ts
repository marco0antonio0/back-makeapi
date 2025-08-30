import { ItensModule } from './itens/itens.module';
import { EndpointModule } from './endpoint/endpoint.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    FirebaseModule,
    ItensModule,
    EndpointModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
