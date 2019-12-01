import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { AmqpModule } from './amqp/amqp.module';

@Module({
  imports: [ConfigModule, AmqpModule],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
