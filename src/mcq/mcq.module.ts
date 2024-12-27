import { Module } from '@nestjs/common';
import { McqService } from './mcq.service';
import { McqController } from './mcq.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mcq } from './entities/mcq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mcq])],
  controllers: [McqController],
  providers: [McqService],
  exports: [McqService],
})
export class McqModule {}
