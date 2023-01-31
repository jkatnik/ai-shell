import * as yaml from 'js-yaml';
import * as fs from 'fs';
import prompts from 'prompts';
import { getHome } from './fileUtils';

interface Config {
  apiKey: string;
}

class ConfigStore {
  private readonly configFilePath: string;

  private config: Config;

  constructor() {
    this.configFilePath = `${getHome()}/config.yaml`;
  }

  async load() {
    if (!fs.existsSync(this.configFilePath)) {
      await prompts.prompt([{
        type: 'text',
        name: 'apiKey',
        message: `You need to configure your OpenAI API Key.
You can get it from https://beta.openai.com/account/api-keys
It will be saved as a plain text in ${this.configFilePath}.
Enter Key:`,
      }]).then((answer) => {
        this.config = {
          apiKey: answer.apiKey,
        };
        this.save();
      });
    }

    const yamlString = fs.readFileSync(this.configFilePath, 'utf8');
    this.config = yaml.load(yamlString) as Config;
  }

  private save() {
    fs.writeFileSync(this.configFilePath, yaml.dump(this.config));
  }

  getApiKey(): string {
    return this.config.apiKey;
  }
}

export default ConfigStore;
