import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Users } from 'src/users/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    if (!jwtSecret) {
      throw new InternalServerErrorException(
        'JWT_SECRET is not defined in environment variables.',
      );
    }

    try {
      const payload: Users = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers

      if (payload.role !== 'Admin') {
        throw new UnauthorizedException(
          'Need Admin Access to execute this Action',
        );
      }
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Access token Missing');
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
