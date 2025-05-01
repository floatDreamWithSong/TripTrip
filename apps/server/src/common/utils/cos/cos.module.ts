import { Module } from '@nestjs/common';
import { CosService } from './cos.service';
import { Configurations } from 'src/common/config';

@Module({
  imports: [Configurations],
  providers: [CosService],
  exports: [CosService],
})
export class CosModule {}
