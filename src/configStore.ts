import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { getHome } from './fileUtils';
import prompts from 'prompts';


export class ConfigStore {
    private readonly configFilePath: string;
    private config: Config;

    constructor() {
        this.configFilePath = `${getHome()}/.config/ai-bash/config.yaml`;
    }

    async load() {
        if (!fs.existsSync(this.configFilePath)) {
            await prompts.prompt([{
                type: 'input',
                name: 'apiKey',
                message: `You need to configure your OpenAI API Key.
You can get it from https://beta.openai.com/account/api-keys
It will be saved as a plain text in ${this.configFilePath}.
Enter Key:`,
            }]).then((answer) => {
                this.config = {
                    apiKeys: [answer.apiKey],
                    lastKeyUsed: answer.apiKey
                };
                this.save();
            });
        }

        const yamlString = fs.readFileSync(this.configFilePath, 'utf8');
        this.config = yaml.load(yamlString) as Config;
    }

    useNextKey() {
        const index = this.config.apiKeys.indexOf(this.config.lastKeyUsed);
        const nextIndex = (index + 1) % this.config.apiKeys.length;
        this.config.lastKeyUsed = this.config.apiKeys[nextIndex] || '';
        this.save()
        return this.config.apiKeys[nextIndex];
    }

    save() {
      fs.writeFileSync(this.configFilePath, yaml.dump(this.config));
    }
}

interface Config {
    apiKeys: string[]
    lastKeyUsed: string
}
