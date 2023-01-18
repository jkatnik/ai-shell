#!/usr/bin/env node

import chalk from 'chalk'
import { ConfigStore } from './configStore'
import * as oai from 'openai'
import { OpenAIApi } from 'openai'
import prompts from 'prompts'
import { clearHistory, saveResultForBashWrapper } from './fileUtils';
import { CmdLineOption, UserAction } from './types';
import { loadHistory, saveUserInputInHistory } from './history';
import { askOpenAiForCommand, promptForUserActionAfterCommand } from './CommandAction';
import { askOpenAiQuestion, promptForUserActionAfterQuestion } from './QuestionAction';
import { printHelp } from './HelpAction';

const ButtonsPrompt = require("./prompts/buttons");

const noop = v => v;

const toPrompt = (type, args) => {
  return new Promise((res, rej) => {
    const p = new ButtonsPrompt(args);
    const onAbort = noop;
    const onSubmit = noop;
    const onExit = noop;
    p.on('state', args.onState || noop);
    p.on('submit', x => res(onSubmit(x)));
    p.on('exit', x => res(onExit(x)));
    p.on('abort', x => rej(onAbort(x)));
  });
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

  if (userInput.startsWith('-q') || userInput.startsWith('--question')) {
    return CmdLineOption.QUESTION
  }

  return CmdLineOption.COMMAND
}
async function run(openAi: OpenAIApi): Promise<void> {
  let userInput = getCmdLineInput()

  const option = detectOption(userInput)

  function startNewContext(): void {
    clearHistory();
    userInput = userInput.replace('-n', '').trim()
  }

  switch (option) {
    case CmdLineOption.HELP: printHelp(); return;
    case CmdLineOption.SEARCH_IN_GOOGLE: searchLatestQueryInGoogle(userInput); return;
    case CmdLineOption.NEW_CONTEXT: startNewContext(); break; // continue as COMMAND or QUESTION
  }

  if (userInput === '') {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('ABORTED');
    return
  }

  saveUserInputInHistory(userInput);
  outer: while(true) {
    const command = await askOpenAiWithContext(userInput, openAi, option)

    console.log(chalk.grey('AI: ') + chalk.greenBright.bold(command))

    const result = await promptIfUserAcceptsCommand(option)

    switch (result) {
      case 'Execute':
        saveResultForBashWrapper('EXECUTE', command);
        break outer;
      case 'Type':
        saveResultForBashWrapper('AUTOCOMPLETE', command);
        break outer;
      case 'Refine':
        userInput = await refineUserInput(userInput);
        break
      case 'AskQuestion':
        userInput = await refineUserInput(userInput, 'Me');
        break
      case 'Cancel':
        saveResultForBashWrapper('ABORTED');
        break outer;
      default:
        console.log(chalk.red('Unexpected result: ' + result));
        saveResultForBashWrapper('ABORTED');
        break outer;
    }
  }
}

function getCmdLineInput() {
  let args = process.argv
  args.shift() // first is path to nodejs
  args.shift() // second is path to the script
  return args.join(' ').trim()
}

async function promptIfUserAcceptsCommand(option: CmdLineOption): Promise<UserAction> {
  switch (option) {
    case CmdLineOption.COMMAND: return promptForUserActionAfterCommand()
    case CmdLineOption.QUESTION: return promptForUserActionAfterQuestion()
  }
}

async function refineUserInput(userInput: string, label?: string): Promise<string> {
  userInput = (await prompts.prompt([{
    type: 'text',
    name: 'userInput',
    message: label || 'Refine your query:',
    default: userInput
  }])).userInput

  saveUserInputInHistory(userInput)

  return userInput
}

async function askOpenAiWithContext(userInput: string, openAi: OpenAIApi, option: CmdLineOption): Promise<string> {
  try {
    switch (option) {
      case CmdLineOption.COMMAND: return askOpenAiForCommand(userInput, openAi);
      case CmdLineOption.QUESTION: return askOpenAiQuestion(userInput, openAi);
      default: throw new Error('Unexpected option: ' + option);
    }
  } catch (error) {
    printError(error);
  }
}

function getLastQuestionFromHistory(): string {
  const history = loadHistory()
    .filter(entry => entry.type === 'H')

  return history.pop().text;
}


function searchLatestQueryInGoogle(userInput: string): string {
  userInput = userInput.replace('-g', '').trim()

  if (!userInput) {
    userInput = getLastQuestionFromHistory()
  }

  const params = new URLSearchParams({q: userInput}).toString()
  const uri = `https://www.google.pl/search?${params}`
  const command = `open ${uri} > /dev/null 2>&1`

  saveResultForBashWrapper('EXECUTE', command);
  return userInput;
}

function printError(error): void {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
}

let configStore = new ConfigStore();
configStore.load().then(() => {
  (prompts.prompts as any).buttons = args => toPrompt('ButtonsPrompt', args);

  const oaiConfig = new oai.Configuration({
    apiKey: configStore.useNextKey()
  });

  const openAi = new oai.OpenAIApi(oaiConfig);

  run(openAi);
})
