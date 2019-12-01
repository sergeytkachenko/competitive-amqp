import * as fs from 'fs';
import { EnvService } from './env.service';
import { Configuration, NsConfiguration } from './configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly config: Configuration;

  constructor(private readonly envService: EnvService) {
    const configPath = this.envService.get('CONFIG_PATH');
    const YAML = require('yaml');
    const yaml = fs.readFileSync(configPath).toString();
    this.config = YAML.parse(yaml);
  }

  getNamespaces(): NsConfiguration[] {
    return this.config.ns;
  }
}
