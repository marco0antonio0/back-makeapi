import { ItensService } from './itens.service';
import { ItensController } from './itens.controller';
import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [
        ItensController,],
    providers: [
        ItensService,],
})
export class ItensModule { }
