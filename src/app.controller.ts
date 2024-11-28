import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/guard/authguard';
import { UserContextService } from './context/userContext';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userContextService: UserContextService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
