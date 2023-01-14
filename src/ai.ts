#!/usr/bin/env node

import chalk from 'chalk'
import {ConfigStore} from './configStore'
import * as oai from 'openai'
import {OpenAIApi} from 'openai'
import inquirer from 'inquirer'
import * as fs from 'fs';
import {
    clearHistory,
    getHistoryPath,
    saveResultForBashWrapper
} from './util/fileUtil';
import {parseTextFromHistory, prepareTextForSave} from "./util/historyUtil";
import {countTokens} from "./util/tokenUtil";
import {checkInput} from "./cmd";

async function askOpenAI(done: boolean, userInput: string, openAi: OpenAIApi) {
  try {
    while (!done) {
      const command = await askOpenAiWithContext(userInput, openAi)
      saveAiOutputInHistory(command)

      console.log(chalk.grey('AI: ') + chalk.greenBright.bold(command))
      const answer = await promptIfUserAcceptsCommand()
      if (answer === 'accept') {
        saveResultForBashWrapper(command)
        done = true
      } else if (answer === 'refine') {
        userInput = await refineUserInput(userInput)
        saveUserInputInHistory(userInput)
      } else {
        saveResultForBashWrapper('aborted');
        done = true
      }
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
  return userInput;
}

async function run(openAi: OpenAIApi): Promise<void> {
    checkInput()
    return;
    let userInput = getCmdLineInput()

    if (userInput.startsWith('-n')) {
        // new context - removing history
        clearHistory()

        userInput = userInput.replace('-n', '').trim()
    }

    if (userInput.startsWith('-g')) {
        userInput = userInput.replace('-g', '').trim()

        if (!userInput) {
            userInput = getLastQuestionFromHistory()
        }

        const params = new URLSearchParams({q: userInput}).toString()
        const uri = `https://www.google.pl/search?${params}`
        const command = `open "${uri}" > /dev/null 2>&1`
        saveResultForBashWrapper(command);
        return
    }

    if (userInput === '') {
        console.log(chalk.yellow('No input provided'));
        saveResultForBashWrapper('aborted');
        return
    }

    saveUserInputInHistory(userInput);
    let done = false;
    await askOpenAI(done, userInput, openAi);
}

function saveUserInputInHistory(userInput: string): void {
    const text = prepareTextForSave(userInput)
    fs.appendFileSync(getHistoryPath(), `H: ${text}\n`);
}

function saveAiOutputInHistory(aiOutput: string): void {
    const text = prepareTextForSave(aiOutput)
    fs.appendFileSync(getHistoryPath(), `AI: ${text}\n`);
}

function getCmdLineInput() {
    let args = process.argv
    args.shift() // first is path to nodejs
    args.shift() // second is path to the script
    return args.join(' ').trim()
}

async function promptIfUserAcceptsCommand(): Promise<string> {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'theme',
            message: 'What to do?',
            choices: [
                {
                    name: 'Accept',
                    value: 'accept',
                },
                {
                    name: 'Refine',
                    value: 'refine',
                },
                'Cancel'
            ],
        }
    ])
        .then((answer) => {
            return answer.theme
        });
}


async function refineUserInput(userInput: string): Promise<string> {
    return (await inquirer.prompt([{
        type: 'input',
        name: 'userInput',
        message: 'Refine your query:',
        default: userInput
    }])).userInput
}

async function askOpenAiWithContext(userInput: string, openAi: OpenAIApi): Promise<string> {
    const tokensForResponse = 200
    const currentQuestion = `Write single bash command in one line. Nothing else! ${userInput}.\n`
    const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion)
    const context = buildContext(freeTokens)

    const prompt = context + currentQuestion
    const completion = await openAi.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0,
        max_tokens: tokensForResponse
    });

    return completion.data.choices[0].text.trim();
}

function buildContext(freeTokens: number): string {
    let context = '';
    let usedTokens = 0;
    const history = loadHistory()
        .map(entry => entry.text)

    // remove current question
    history.pop();

    while (usedTokens < freeTokens && history.length > 0) {
        const entry = history.shift() + '\n\n'
        const tokens = countTokens(entry)
        if (usedTokens + tokens < freeTokens) {
            context += entry
            usedTokens += tokens
        }
    }
    return context
}

function getLastQuestionFromHistory(): string {
    const history = loadHistory()
        .filter(entry => entry.type === 'H')

    return history.pop().text;
}

function loadHistory() {
    return fs.readFileSync(getHistoryPath(), 'utf8').split('\n')
        .filter(line => line)
        .map(text => parseTextFromHistory(text))
        .filter(entry => entry.text !== '')
}



let configStore = new ConfigStore();
configStore.load().then(() => {
    const oaiConfig = new oai.Configuration({
        apiKey: configStore.useNextKey()
    })

    const openAi = new oai.OpenAIApi(oaiConfig)

    run(openAi)
})
