import { TaskRepository } from './task.repository';
import { OutboxMessage } from '../amqp/dto/outbox.message';
import { QueueRepository } from './queue.repository';
import { InboxMessage } from '../amqp/dto/inbox.message';
import { OutboxPublisher } from '../amqp/outbox/outbox.publisher';
import { NsConfiguration } from '../config/configuration';
import { ConfirmMessage } from '../amqp/dto/confirm.message';

export class TaskService {

  private readonly ns: NsConfiguration;
  private readonly workers: number = 3;
  private cursorQueue: number = -1;
  private inProcessTasks: number = 0;

  constructor(private readonly outboxPublisher: OutboxPublisher,
              private readonly taskRepository: TaskRepository,
              private readonly queueRepository: QueueRepository, ns: NsConfiguration) {
    this.ns = ns;
    this.init();
  }

  private init(): void {
    setInterval(() => this.nextTick(), 15);
  }

  async confirm(msg: ConfirmMessage): Promise<void> {
    this.inProcessTasks--;
  }

  async push(task: InboxMessage): Promise<any> {
    await this.taskRepository.addTask(this.ns.inbox, task);
    await this.queueRepository.addQueueNotExists(this.ns.inbox, task.queue);
  }

  async nextTick(): Promise<void> {
    if (this.inProcessTasks > this.workers * 1) {
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
    console.log(outboxMsq);
  }
}
