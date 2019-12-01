import * as http from 'http';
import { TaskRepository } from './task.repository';
import { OutboxMessage } from '../amqp/dto/outbox.message';
import { QueueRepository } from './queue.repository';
import { InboxMessage } from '../amqp/dto/inbox.message';
import { OutboxPublisher } from '../amqp/outbox/outbox.publisher';
import { NsConfiguration } from '../config/configuration';
import { ConfirmMessage } from '../amqp/dto/confirm.message';
import { EnvService } from '../config/env.service';

export class TaskService {

  private readonly ns: NsConfiguration;
  private outboxConsumerCount: number = 3;
  private cursorQueue: number = -1;
  private inProcessTasks: number = 0;

  constructor(private readonly envService: EnvService,
              private readonly outboxPublisher: OutboxPublisher,
              private readonly taskRepository: TaskRepository,
              private readonly queueRepository: QueueRepository, ns: NsConfiguration) {
    this.ns = ns;
    this.init();
  }

  private init(): void {
    setInterval(() => this.nextTick(), 15);
    setInterval(() => this.actualizeOutboxConsumerCount(), 60 * 1000);
    this.actualizeOutboxConsumerCount();
  }

  private async actualizeOutboxConsumerCount(): Promise<void> {
    try {
      const url = `${this.envService.get('AMQP_ADMIN_CONNECT_STRING')}/api/consumers`;
      const username = this.envService.get('AMQP_ADMIN_USER');
      const password = this.envService.get('AMQP_ADMIN_PASSWORD');
      const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
      const headers = {Authorization: auth};
      http.get(url, {headers}, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            const consumers = parsedData.filter(c => c.queue.name === this.ns.outbox);
            this.outboxConsumerCount = consumers.length || this.outboxConsumerCount;
            console.log(`actualize outbox(${this.ns.outbox}) consumers count: ${this.outboxConsumerCount}`);
          } catch (e) {
            console.error(e.message);
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  private async nextTick(): Promise<void> {
    if (this.inProcessTasks > this.outboxConsumerCount * 3) {
      return;
    }
    const queues = this.queueRepository.getQueues(this.ns.inbox);
    if (!queues.length) {
      return;
    }
    this.cursorQueue++;
    if (queues.length <= this.cursorQueue) {
      this.cursorQueue = 0;
    }
    const queue = queues[this.cursorQueue];
    const task = await this.taskRepository.getNextTask(this.ns.inbox, queue);
    if (!task) {
      return;
    }
    const outboxMsq = {
      ns: this.ns.outbox,
      taskId: task.id,
      queue,
      payload: task.payload,
    } as OutboxMessage;
    this.outboxPublisher.send(this.ns.outbox, outboxMsq);
    this.inProcessTasks++;
    // console.log('send to outbox: ', outboxMsq);
  }

  async confirm(msg: ConfirmMessage): Promise<void> {
    this.inProcessTasks--;
  }

  async push(task: InboxMessage): Promise<any> {
    await this.taskRepository.addTask(this.ns.inbox, task);
    await this.queueRepository.addQueueNotExists(this.ns.inbox, task.queue);
  }
}
