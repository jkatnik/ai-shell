#!/usr/bin/env node

import chalk from 'chalk'
import { ConfigStore } from './configStore'
import * as oai from 'openai'
import { OpenAIApi } from 'openai'
import prompts from 'prompts'
import * as promptBtn from './prompts/buttons';
import { clearHistory, saveResultForBashWrapper } from './fileUtils';
import { CmdLineOption, UserAction } from './types';
import { saveUserInputInHistory } from './history';
import { askOpenAiForCommand, promptForUserActionAfterCommand } from './actions/CommandAction';
import { askOpenAiQuestion, promptForUserActionAfterQuestion } from './actions/QuestionAction';
import { printHelp } from './actions/HelpAction';
import { searchLatestQueryInGoogle } from './actions/SearchInGoogle';

async function run(openAi: OpenAIApi): Promise<void> {
  function startNewContext(): void {
    clearHistory();
    userInput = userInput.replace('-n', '').trim()
  }

  let userInput = getCmdLineInput()

  let option = detectOption(userInput)

  switch (option) {
    case CmdLineOption.HELP: printHelp(); return;
    case CmdLineOption.SEARCH_IN_GOOGLE: searchLatestQueryInGoogle(userInput); return;
    case CmdLineOption.NEW_CONTEXT:
      startNewContext();
      option = CmdLineOption.COMMAND;
      break; // continue as COMMAND or QUESTION
  }

  if (userInput === '') {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('ABORTED');
    return
  }

  saveUserInputInHistory(userInput);
  outer: while(true) {
    const command = await askOpenAiWithContext(userInput, openAi, option)

    console.log(chalk.grey('\nAI: ') + chalk.cyanBright.bold(command) + '\n')

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

function printError(error): void {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
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

let configStore = new ConfigStore();
configStore.load().then(() => {
  (prompts.prompts as any).buttons = args => promptBtn.toPrompt('ButtonsPrompt', args);

  const oaiConfig = new oai.Configuration({
    apiKey: configStore.useNextKey()
  });

  const openAi = new oai.OpenAIApi(oaiConfig);

  run(openAi);
})
