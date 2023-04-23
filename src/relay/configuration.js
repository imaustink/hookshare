import fs from 'fs';
import path from 'path';

export class Configuration {
  constructor({ configPath }) {
    this.configPath = configPath;
    this.load();
  }

  configPath = null;
  #config = null;

  load() {
    const config = fs.readFileSync(path.resolve(this.configPath));
    this.#config = JSON.parse(config);
  }

  get() {
    return this.#config;
  }
}
