import { EndpointController } from './endpoint.controller';
import { EndpointService } from './endpoint.service';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EndpointRepository } from './endpoint.repository';
import { ItensModule } from 'src/itens/itens.module';

@Module({
    imports: [FirebaseModule,ItensModule],
    controllers: [
        EndpointController,],
    providers: [
        EndpointService, EndpointRepository],
})
export class EndpointModule { }
