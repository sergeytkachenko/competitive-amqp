import { Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: EnvService,
      useValue: new EnvService(`${process.env.NODE_ENV || 'development'}.env`),
    },
    {
      provide: ConfigService,
      useClass: ConfigService,
    }
  ],
  exports: [ConfigService, EnvService ],
})
export class ConfigModule {}
