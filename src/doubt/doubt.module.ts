import { Module } from '@nestjs/common';
import { DoubtService } from './doubt.service';
import { DoubtController } from './doubt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doubt } from './entities/doubt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doubt])],
  controllers: [DoubtController],
  providers: [DoubtService],
  exports: [DoubtService],
})
export class DoubtModule {}
