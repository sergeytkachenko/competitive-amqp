import { Injectable } from '@nestjs/common';
import { OutboxMessage } from '../dto/outbox.message';

@Injectable()
export class OutboxPublisher {

  channel: any;

  constructor(channel: any) {
    this.channel = channel;
  }

  send(outboxQueue: string, message: OutboxMessage): Promise<boolean> {
    return new Promise((resolve) => {
      const msg = Buffer.from(JSON.stringify(message));
      const sending = this.channel.sendToQueue(outboxQueue, msg);
      resolve(sending);
    });
  }
}
