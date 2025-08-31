import { ItensService } from './itens.service';
import { ItensController } from './itens.controller';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EndpointModule } from 'src/endpoint/endpoint.module';
import { ItensRepository } from './itens.repository';

@Module({
    imports: [FirebaseModule],
    controllers: [
        ItensController,],
    providers: [
        ItensService, ItensRepository],
    exports:[ItensRepository]
})
export class ItensModule { }
