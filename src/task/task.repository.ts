import { Injectable } from '@nestjs/common';
import { InboxMessage } from '../amqp/dto/inbox.message';
import * as uuidv1 from 'uuid/v1';
import { RedisClientReader } from './RedisClientReader';
import { RedisClientWriter } from './RedisClientWriter';

@Injectable()
export class TaskRepository {

  constructor(private readonly redisClientReader: RedisClientReader,
              private readonly redisClientWriter: RedisClientWriter) {}

  async addTask(ns: string, task: InboxMessage): Promise<void> {
    return new Promise(resolve => {
      const body = {
        ...task,
        id: uuidv1(),
      };
      this.redisClientWriter.RPUSH(`${ns}_${task.queue}`, JSON.stringify(body), () => resolve());
    });
  }

  async getNextTask(ns: string, queue: string): Promise<any> {
    return new Promise(resolve => {
      this.redisClientReader.LPOP(`${ns}_${queue}`, (err, json) => {
        return resolve(JSON.parse(json));
      });
    });
  }
}
