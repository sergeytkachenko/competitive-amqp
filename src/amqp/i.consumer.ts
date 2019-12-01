export interface IConsumer {
  consume(queue: string): Promise<any>;
}
