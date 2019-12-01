export class OutboxMessage {
  ns: string;
  queue: string;
  taskId: string;
  payload: any;
}
