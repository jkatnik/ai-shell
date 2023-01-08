import * as yaml from 'js-yaml';
import * as fs from 'fs';

import * as path from 'path';


export class ConfigStore {
    private homeDir: string;
    config: Config;

    constructor() {
        this.homeDir = path.resolve(process.env['HOME'] || process.env['USERPROFILE']);
        const yamlString = fs.readFileSync(`${this.homeDir}/.config/ai/config.yaml`, 'utf8');
        this.config = yaml.load(yamlString) as Config;
    }

    useNextKey() {
        const index = this.config.apiKeys.indexOf(this.config.lastKeyUsed);
        const nextIndex = (index + 1) % this.config.apiKeys.length;
        this.config.lastKeyUsed = this.config.apiKeys[nextIndex] || '';
        return this.config.apiKeys[nextIndex];
    }

    save() {
      fs.writeFileSync(`${this.homeDir}/.config/ai/config.yaml`, yaml.dump(this.config));
    }
}

interface Config {
    apiKeys: string[]
    lastKeyUsed: string
}
