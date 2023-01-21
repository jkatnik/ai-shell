import { encode } from 'gpt-3-encoder';
import { OpenAIApi } from 'openai';
import { loadHistory } from './history';
import { CmdLineOption } from './types';
import { askOpenAiForCommand } from './actions/CommandAction';
import { askOpenAiQuestion } from './actions/QuestionAction';

export const countTokens = (question: string) => encode(question).length;

export const buildContext = (freeTokens: number): string => {
  let context = '';
  let usedTokens = 0;
  const history = loadHistory()
    .map((entry) => entry.text);

  // remove current question
  history.pop();

  while (usedTokens < freeTokens && history.length > 0) {
    const entry = `${history.shift()}\n\n`;
    const tokens = countTokens(entry);
    if (usedTokens + tokens < freeTokens) {
      context += entry;
      usedTokens += tokens;
    }
  }
  return context;
};

export const printError = (error): void => {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
};

export const askOpenAiWithContext = async (
  userInput: string,
  openAi: OpenAIApi,
  option: CmdLineOption,
): Promise<string> => {
  switch (option) {
    case CmdLineOption.COMMAND:
      return askOpenAiForCommand(userInput, openAi);
    case CmdLineOption.QUESTION:
      return askOpenAiQuestion(userInput, openAi);
    default:
      throw new Error(`Unexpected option: ${option}`);
  }
};
