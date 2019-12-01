import { Module } from '@nestjs/common';
import { EnvService } from '../config/env.service';
import { ConsumerLauncher } from './consumer.launcher';
import { ConfigModule } from '../config/config.module';
import { TaskModule } from '../task/task.module';
import { OutboxPublisher } from './outbox/outbox.publisher';

@Module({
  providers: [
    {
      provide: 'AMQP_CONNECT_STRING',
      useFactory: (envService: EnvService) => {
        return envService.get('AMQP_CONNECT_STRING');
      },
      inject: [EnvService],
    },
    {
      provide: OutboxPublisher,
      useFactory: async (envService: EnvService) => {
        const connection = await require('amqplib')
          .connect(envService.get('AMQP_CONNECT_STRING'));
        const channel = await connection.createChannel();
        return new OutboxPublisher(channel);
      },
      inject: [EnvService],
    },
    {
      provide: ConsumerLauncher,
      useClass: ConsumerLauncher,
    },
  ],
  exports: [OutboxPublisher],
  imports: [ConfigModule, TaskModule],
})
export class AmqpModule {}
