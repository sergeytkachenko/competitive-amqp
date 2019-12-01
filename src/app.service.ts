import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {

  constructor(private readonly configService: ConfigService) {
  }

  getHello(): string {
    console.log(this.configService.getNamespaces());
    return 'Hello World!';
  }
}
