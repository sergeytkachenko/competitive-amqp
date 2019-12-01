import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { TaskRepository } from './task.repository';
import { QueueRepository } from './queue.repository';
import { RedisClient } from 'redis';
import { ConfigService } from '../config/config.service';
import { EnvService } from '../config/env.service';

@Module({
  providers: [
    {
      provide: TaskRepository,
      useClass: TaskRepository,
    },
    {
      provide: QueueRepository,
      useClass: QueueRepository,
    },
    {
      provide: RedisClient,
      useFactory: (envService: EnvService) => {
        const redis = require('redis');
        return redis.createClient(envService.get('REDIS_CONNECT_STRING'));
      },
      inject: [EnvService],
    },
    {
      provide: 'NAMESPACES',
      useFactory: (configService: ConfigService) => {
        return configService.getNamespaces().map(ns => ns.inbox);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TaskRepository, QueueRepository],
  imports: [ConfigModule],
})
export class TaskModule {}
