import { Injectable } from '@nestjs/common';
import { OutboxMessage } from '../dto/outbox.message';

@Injectable()
export class OutboxPublisher {

  channel: any;

  constructor(channel: any) {
    this.channel = channel;
  }

  send(outboxQueue: string, message: OutboxMessage): void {
    const msg = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(outboxQueue, msg);
  }
}
