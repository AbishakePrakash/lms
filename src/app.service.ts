import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'LMS Server launched and open to recieve requests';
  }
}
