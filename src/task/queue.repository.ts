import { RedisClient } from 'redis';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientReader } from './RedisClientReader';
import { RedisClientWriter } from './RedisClientWriter';

@Injectable()
export class QueueRepository {

  private readonly namespaces: string[];
  private queues: any = {};

  constructor(private readonly redisClientReader: RedisClientReader,
              private readonly redisClientWriter: RedisClientWriter,
              @Inject('NAMESPACES') namespaces: string[]) {
    this.namespaces = namespaces;
    this.init();
  }

  private async init(): Promise<any> {
    await this.actualiseQueueList();
  }

  async addQueueNotExists(ns: string, queue: string): Promise<any> {
    if (this.queues[ns] && this.queues[ns].indexOf(`${queue}`) !== -1) {
      return Promise.resolve();
    }
    await this.addQueue(ns, queue);
  }

  private async fetchQueueList(ns: string) {
    return new Promise(resolve => {
      this.redisClientReader.SMEMBERS(`${ns}_queue`, (err, list) => {
        this.queues[ns] = list;
        resolve();
      });
    });
  }

  private async actualiseQueueList(): Promise<any> {
    const fn = [];
    this.namespaces.forEach(ns => {
      fn.push(this.fetchQueueList(ns));
    });
    return Promise.all(fn);
  }

  private async addQueue(ns: string, queue: string): Promise<void> {
    return new Promise(resolve => {
      this.queues[ns] = this.queues[ns] || [];
      this.queues[ns].push(queue);
      this.redisClientWriter.SADD(`${ns}_queue`, queue, () => resolve());
    });
  }

  getQueues(ns: string): string[] {
    return this.queues[ns] || [];
  }
}
