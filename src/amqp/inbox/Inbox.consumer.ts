import { AbstractConsumer } from '../abstract.consumer';
import { TaskService } from '../../task/task.service';
import { InboxMessage } from '../dto/inbox.message';

export class InboxConsumer extends AbstractConsumer {

  constructor(amqpConnectionString: string,
              private readonly ns: string,
              queue: string,
              prefetchCount: number,
              private readonly taskService: TaskService) {
    super(amqpConnectionString, queue, prefetchCount);
  }

  async onConsume(msg: any): Promise<any> {
    let inboxMessage = null;
    try {
      inboxMessage = JSON.parse(msg.content) as InboxMessage;
      await this.taskService.push(inboxMessage);
    } catch (e) {
      console.error(`msg.content not of InboxMessage type`);
    }
    this.channel.ack(msg);
  }

}
