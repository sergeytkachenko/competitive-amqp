export class NsConfiguration {
  inbox: string;
  outbox: string;
  confirm: string;
  inboxPrefetch: number = 1;
  confirmPrefetch: number = 1;
}

// tslint:disable-next-line:max-classes-per-file
export class Configuration {
  ns: NsConfiguration[];
}
