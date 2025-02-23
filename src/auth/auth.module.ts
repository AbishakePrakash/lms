import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from 'src/otp/otp.module';
import { UsersModule } from 'src/users/users.module';

const jwtSecret = process.env.JWT_SECRET;

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    OtpModule,
    UsersModule,
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '5d' },
    }),
  ],
})
export class AuthModule {}
