export class NsConfiguration {
  inbox: string;
  outbox: string;
  confirm: string;
  inboxPrefetch: number;
}

// tslint:disable-next-line:max-classes-per-file
export class Configuration {
  ns: NsConfiguration[];
}
