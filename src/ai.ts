#!/usr/bin/env node

import * as color from 'kleur';
import * as oai from 'openai';
import { OpenAIApi } from 'openai';
import prompts from 'prompts';
import ConfigStore from './configStore';
import * as promptBtn from './prompts/buttons';
import { clearHistory, saveResultForBashWrapper } from './fileUtils';
import { CmdLineOption, UserAction } from './types';
import { saveUserInputInHistory } from './history';
import { promptForUserActionAfterCommand } from './actions/CommandAction';
import { promptForUserActionAfterQuestion } from './actions/QuestionAction';
import printHelp from './actions/HelpAction';
import searchLatestQueryInGoogle from './actions/SearchInGoogle';
import { detectOption, getCmdLineInput } from './cmdLineUtils';
import { askOpenAiWithContext } from './OpenAiUtils';
import commandChecker from './command-checker';

async function promptUserForNextAction(option: CmdLineOption): Promise<UserAction> {
  switch (option) {
    case CmdLineOption.COMMAND:
      return promptForUserActionAfterCommand();
    case CmdLineOption.QUESTION:
      return promptForUserActionAfterQuestion();
    default:
      throw new Error(`Unexpected option: ${option}`);
  }
}

const refineUserInput = async (userInput: string, label?: string): Promise<string> => (await prompts.prompt([{
  type: 'text',
  name: 'userInput',
  message: label || 'Refine your query:',
  initial: userInput,
}])).userInput;

const handleAiOptions = async (
  openAi: OpenAIApi,
  option: CmdLineOption.COMMAND | CmdLineOption.QUESTION,
  userInput: string,
): Promise<void> => {
  let newUserInput = userInput;
  let continueProcessing = true;

  while (continueProcessing) {
    /* eslint-disable no-await-in-loop */
    saveUserInputInHistory(newUserInput);
    const command = await askOpenAiWithContext(newUserInput, openAi, option);

    const commandToDisplay = `${commandChecker(command)}`;

    console.log(`${color.grey('\nAI: ') + commandToDisplay}\n`);

    const result = await promptUserForNextAction(option);

    switch (result) {
      case 'Execute':
        saveResultForBashWrapper('EXECUTE', command);
        continueProcessing = false;
        break;
      case 'Type':
        saveResultForBashWrapper('AUTOCOMPLETE', command);
        continueProcessing = false;
        break;
      case 'Refine':
        newUserInput = await refineUserInput(newUserInput);
        break;
      case 'AskQuestion':
        newUserInput = await refineUserInput(newUserInput, 'Me');
        break;
      case 'Cancel':
      case undefined:
        saveResultForBashWrapper('ABORTED');
        continueProcessing = false;
        break;
      default:
        console.log(color.red(`Unexpected result: ${result}`));
        saveResultForBashWrapper('ABORTED');
        continueProcessing = false;
        break;
    }
  }
};

async function run(openAi: OpenAIApi): Promise<void> {
  let userInput = getCmdLineInput();

  function startNewContext(): void {
    clearHistory();
    userInput = userInput.replace('-n', '').trim();
  }

  let option = detectOption(userInput);

  if (userInput === '') {
    console.log(color.yellow('No input provided'));
    saveResultForBashWrapper('ABORTED');
    return;
  }

  switch (option) {
    case CmdLineOption.HELP:
      printHelp();
      return;
    case CmdLineOption.SEARCH_IN_GOOGLE:
      searchLatestQueryInGoogle(userInput);
      return;
    case CmdLineOption.NEW_CONTEXT:
      startNewContext();
      option = CmdLineOption.COMMAND;
      handleAiOptions(openAi, option, userInput);
      break; // continue as COMMAND
    default:
      handleAiOptions(openAi, option, userInput);
  }
}

const configStore = new ConfigStore();

configStore.load().then(() => {
  (prompts.prompts as any).buttons = (args) => promptBtn.toPrompt('ButtonsPrompt', args);

  const oaiConfig = new oai.Configuration({
    apiKey: configStore.useNextKey(),
  });

  const openAi = new oai.OpenAIApi(oaiConfig);

  run(openAi);
});
