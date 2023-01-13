#!/usr/bin/env node

import chalk from 'chalk'
import { ConfigStore } from './configStore'
import * as oai from 'openai'
import inquirer from 'inquirer'
import * as fs from 'fs';
import { getHistoryPath, parseTextFromHistory, prepareTextForSave, saveResultForBashWrapper } from './fileUtils';
import { encode } from 'gpt-3-encoder';

let configStore = new ConfigStore()
const oaiConfig = new oai.Configuration({
  apiKey: configStore.useNextKey()
})
configStore.save()

const openAi = new oai.OpenAIApi(oaiConfig)

function clearHistory(): void {
  fs.truncateSync(getHistoryPath());
}

async function run(): Promise<void> {
  let userInput = getCmdLineInput()

  if (userInput.startsWith('-n')) {
    // new context - removing history
    clearHistory()
    console.log(chalk.white('History cleared'));

    userInput = userInput.replace('-n', '').trim()
  }

  if (userInput === '') {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('aborted');
    return
  }

  saveUserInputInHistory(userInput);
  let done = false;

  try {
    while(!done) {
      const command = await askOpenAiWithContext(userInput)
      saveAiOutputInHistory(command)

      console.log(chalk.grey('AI: ') + chalk.white.bold(command))
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

async function askOpenAiWithContext(userInput: string): Promise<string> {
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

const removePrefix = (text: string): string => text.replace(/^(H|AI): /, '');

function buildContext(freeTokens: number): string {
  let context = '';
  let usedTokens = 0;
  const history = fs.readFileSync(getHistoryPath(), 'utf8').split('\n')
    .map(text => removePrefix(text))
    .map(text => parseTextFromHistory(text))
    .filter(text => text.trim() !== '')

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

const countTokens = (question: string) => encode(question).length

run()
