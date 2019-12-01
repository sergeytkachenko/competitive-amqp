import { AbstractConsumer } from '../abstract.consumer';
import { TaskService } from '../../task/task.service';
import { ConfirmMessage } from '../dto/confirm.message';

export class ConfirmConsumer extends AbstractConsumer {

  constructor(amqpConnectionString: string,
              queue: string,
              prefetchCount: number,
              private readonly taskService: TaskService) {
    super(amqpConnectionString, queue, prefetchCount);
  }

  async onConsume(msg: any): Promise<any> {
    const massage = JSON.parse(msg.content) as ConfirmMessage;
    await this.taskService.confirm(massage);
    this.channel.ack(msg);
  }

}
