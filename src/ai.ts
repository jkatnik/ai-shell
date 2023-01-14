#!/usr/bin/env node

import chalk from 'chalk'
import { ConfigStore } from './configStore'
import * as oai from 'openai'
import { OpenAIApi } from 'openai'
import inquirer from 'inquirer'
import * as fs from 'fs';
import { clearHistory, getHistoryPath, parseTextFromHistory, prepareTextForSave, saveResultForBashWrapper } from './fileUtils';
import { encode } from 'gpt-3-encoder';

enum CmdLineOption {
  HELP, NEW_CONTEXT, SEARCH_IN_GOOGLE, COMMAND
}
function detectOption(userInput: string): CmdLineOption {
  if (userInput.startsWith('-h') || userInput.startsWith('--help')) {
    return CmdLineOption.HELP
  }

  if (userInput.startsWith('-n') || userInput.startsWith('--new-context')) {
    return CmdLineOption.NEW_CONTEXT
  }

  if (userInput.startsWith('-g') || userInput.startsWith('--google')) {
    return CmdLineOption.SEARCH_IN_GOOGLE
  }

  return CmdLineOption.COMMAND
}
async function run(openAi: OpenAIApi): Promise<void> {
  let userInput = getCmdLineInput()

  const option = detectOption(userInput)
  switch (option) {
    case CmdLineOption.HELP:
      printHelp();
      return;
    case CmdLineOption.SEARCH_IN_GOOGLE:
      searchLatestQueryInGoogle(userInput);
      return;
    case CmdLineOption.NEW_CONTEXT:
      clearHistory();
      userInput = userInput.replace('-n', '').trim() // continue as COMMAND
      break;
  }

  if (userInput === '') {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('aborted');
    return
  }

  saveUserInputInHistory(userInput);
    outer: while(true) {
      const command = await askOpenAiWithContext(userInput, openAi)
      console.log(chalk.grey('AI: ') + chalk.greenBright.bold(command))

      switch (await promptIfUserAcceptsCommand()) {
        case 'Accept': saveResultForBashWrapper(command); break outer;
        case 'Refine': userInput = await refineUserInput(userInput); break
        case 'Cancel': saveResultForBashWrapper('aborted'); break outer;
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

type UserAction = 'Accept' | 'Refine' | 'Cancel'
async function promptIfUserAcceptsCommand(): Promise<UserAction> {
  return inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'What to do?',
        choices: [ 'Accept', 'Refine', 'Cancel' ],
      }
    ])
    .then((answer) => {
      return answer.theme
    });
}

async function refineUserInput(userInput: string): Promise<string> {
  userInput = (await inquirer.prompt([{
    type: 'input',
    name: 'userInput',
    message: 'Refine your query:',
    default: userInput
  }])).userInput

  saveUserInputInHistory(userInput)

  return userInput
}

async function askOpenAiWithContext(userInput: string, openAi: OpenAIApi): Promise<string> {
  const tokensForResponse = 200
  const currentQuestion = `Write single bash command in one line. Nothing else! ${userInput}.\n`
  const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion)
  const context = buildContext(freeTokens)
  const prompt = context + currentQuestion

  try {
    const completion = await openAi.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0,
      max_tokens: tokensForResponse
    });

    const command = completion.data.choices[0].text.trim();

    saveAiOutputInHistory(command)

    return command;
  } catch (error) {
    printError(error);
  }
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
  .map(text => parseTextFromHistory(text))
  .filter(entry => entry.text !== '')
}

function searchLatestQueryInGoogle(userInput: string): string {
  userInput = userInput.replace('-g', '').trim()

  if (!userInput) {
    userInput = getLastQuestionFromHistory()
  }

  const params = new URLSearchParams({q: userInput}).toString()
  const uri = `https://www.google.pl/search?${params}`
  const command = `open ${uri} > /dev/null 2>&1`

  saveResultForBashWrapper(command);
  return userInput;
}

function printHelp(): void {
  console.log(`Options:
-n - new context, clears history
-g - queries google with last command from history
-h - prints this help`)
}

function printError(error): void {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
}

const countTokens = (question: string) => encode(question).length

let configStore = new ConfigStore();
configStore.load().then(() => {
  const oaiConfig = new oai.Configuration({
    apiKey: configStore.useNextKey()
  })

  const openAi = new oai.OpenAIApi(oaiConfig)

  run(openAi)
})
