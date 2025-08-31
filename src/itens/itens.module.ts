import { ItensService } from './itens.service';
import { ItensController } from './itens.controller';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EndpointModule } from 'src/endpoint/endpoint.module';
import { ItensRepository } from './itens.repository';

@Module({
    imports: [FirebaseModule, EndpointModule],
    controllers: [
        ItensController,],
    providers: [
        ItensService,ItensRepository],
})
export class ItensModule { }
