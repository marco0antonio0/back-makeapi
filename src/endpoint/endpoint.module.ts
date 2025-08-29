import { EndpointController } from './endpoint.controller';
import { EndpointService } from './endpoint.service';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EndpointRepository } from './endpoint.repository';

@Module({
    imports: [FirebaseModule],
    controllers: [
        EndpointController,],
    providers: [
        EndpointService, EndpointRepository],
})
export class EndpointModule { }
