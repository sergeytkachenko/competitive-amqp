import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { InboxConsumer } from './inbox/Inbox.consumer';
import { TaskRepository } from '../task/task.repository';
import { QueueRepository } from '../task/queue.repository';
import { TaskService } from '../task/task.service';
import { OutboxPublisher } from './outbox/outbox.publisher';
import { NsConfiguration } from '../config/configuration';

@Injectable()
export class ConsumerLauncher {
  constructor(private readonly configService: ConfigService,
              private readonly outboxPublisher: OutboxPublisher,
              private readonly taskRepository: TaskRepository,
              private readonly queueRepository: QueueRepository,
              @Inject('AMQP_CONNECT_STRING') private readonly amqpConnectionString: string) {
    this.runConsumers();
  }

  runConsumers(): void {
    const namespaces = this.configService.getNamespaces();
    const fn = [];
    namespaces.forEach(ns => fn.push(this.runInboxConsumer(ns)));
    Promise.all(fn);
  }

  private async runInboxConsumer(ns: NsConfiguration): Promise<any> {
    const namespace = ns.inbox;
    const taskService = new TaskService(this.outboxPublisher,
      this.taskRepository, this.queueRepository, ns);
    await this.createQueuesIfNotExists(ns);
    const inboxConsumer = new InboxConsumer(this.amqpConnectionString, namespace,
      ns.inbox, ns.inboxPrefetch, taskService);
  }

  private async createQueuesIfNotExists(ns: NsConfiguration): Promise<void> {
    const connection = await require('amqplib').connect(this.amqpConnectionString);
    const channel = await connection.createChannel();
    await channel.assertQueue(ns.outbox, {durable: true});
    await channel.assertQueue(ns.confirm, {durable: true});
    await channel.close();
    await connection.close();
  }
}
