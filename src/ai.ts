#!/usr/bin/env node

import * as oai from 'openai';
import { OpenAIApi } from 'openai';
import prompts from 'prompts';
import ConfigStore from './configStore';
import * as promptBtn from './prompts/buttons';
import { clearHistory } from './fileUtils';
import handleCommand from './actions/CommandAction';
import printHelp from './actions/HelpAction';
import searchLatestQueryInGoogle from './actions/SearchInGoogle';
import { getCmdLineInput } from './cmdLineUtils';
import { Mode, parseCommandLineInput } from './commandLineInputParser';
import handleQuestion from './actions/QuestionAction';

async function run(openAi: OpenAIApi): Promise<void> {
  const state = parseCommandLineInput(getCmdLineInput());

  if (state.newContext) {
    clearHistory();
  }

  switch (state.mode) {
    case Mode.HELP:
      printHelp();
      break;
    case Mode.SEARCH_IN_GOOGLE:
      searchLatestQueryInGoogle(state.userQuery);
      break;
    case Mode.COMMAND:
      handleCommand(openAi, state.userQuery);
      break;
    case Mode.QUESTION:
      handleQuestion(openAi, state.userQuery);
      break;
    default:
      throw new Error(`Unexpected mode: ${state.mode}`);
  }
}

const configStore = new ConfigStore();

configStore.load().then(() => {
  (prompts.prompts as any).buttons = (args) => promptBtn.toPrompt('ButtonsPrompt', args);

  const oaiConfig = new oai.Configuration({
    apiKey: configStore.getApiKey(),
  });

  const openAi = new oai.OpenAIApi(oaiConfig);

  run(openAi);
});
