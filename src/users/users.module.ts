import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { OtpModule } from 'src/otp/otp.module';
import { UserContextService } from 'src/context/userContext';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), OtpModule],
  controllers: [UsersController],
  providers: [UsersService, UserContextService],
  exports: [UsersService],
})
export class UsersModule {}
