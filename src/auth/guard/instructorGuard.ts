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

const jwtSecret = 'lmsbeta';

@Injectable()
export class InstructorGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    // private userContextService: UserContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('ins');
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
      // try {
      //   this.userContextService.setUser(payload);
      // } catch (error) {
      //   console.error('Error in setting user context:', error);
      //   throw error;
      // }

      if (payload.role !== 'Instructor' && payload.role !== 'Admin') {
        throw new UnauthorizedException(
          'Need Instructor Access to execute this Action',
        );
      }
      request['user'] = payload;
    } catch (error) {
      throw error;
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
