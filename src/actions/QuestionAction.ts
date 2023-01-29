import { OpenAIApi } from 'openai';
import prompts from 'prompts';
import chalk from 'chalk';
import { saveAiOutputInHistory } from '../history';
import { buildContext, countTokens, printError } from '../OpenAiUtils';
import { UserAction } from '../types';
import clearLastLine from '../terminal-utils';

export const askOpenAiQuestion = async (userInput: string, openAi: OpenAIApi): Promise<string> => {
  const tokensForResponse = 1000;
  const currentQuestion = `${userInput}.\n`;

  const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion);
  const context = buildContext(freeTokens);
  const prompt = context + currentQuestion;

  try {
    console.log(chalk.grey('Waiting for OpenAI ...'));
    const completion = await openAi.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      max_tokens: tokensForResponse,
    });
    clearLastLine();

    const command = completion.data.choices[0].text.trim();

    saveAiOutputInHistory(command);
    return command;
  } catch (error) {
    printError(error);
    return '';
  }
};

export const promptForUserActionAfterQuestion = async (): Promise<UserAction> => prompts.prompt([
  {
    type: 'buttons',
    name: 'action',
    message: 'What to do?',
    choices: [
      {
        title: 'Continue',
        value: UserAction.ASK_QUESTION,
      },
      {
        title: 'Done',
        value: UserAction.CANCEL,
      }],
  },
])
  .then((answer) => answer.action);
