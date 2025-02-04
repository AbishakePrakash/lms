import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    const array = ['html', 'css', 'js'];

    const string = JSON.stringify(array);
    const newArray = JSON.parse(string);
    const result = { array: array, stringified: string, parsed: newArray };
    console.log(result);

    return result;
    // return 'LMS Server launched and open to recieve requests';
  }
}
