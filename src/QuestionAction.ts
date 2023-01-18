import { OpenAIApi } from 'openai';
import { saveAiOutputInHistory } from './history';
import { buildContext, countTokens } from './OpenAiUtils';
import { UserAction } from './types';
import prompts from 'prompts';

export const askOpenAiQuestion = async (userInput: string, openAi: OpenAIApi): Promise<string> => {
  const tokensForResponse = 1000
  const currentQuestion = `${userInput}.\n`;

  const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion)
  const context = buildContext(freeTokens)
  const prompt = context + currentQuestion

  const completion = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    max_tokens: tokensForResponse
  });

  const command = completion.data.choices[0].text.trim();

  saveAiOutputInHistory(command)

  return command;
}

export const promptForUserActionAfterQuestion = async (): Promise<UserAction> => prompts.prompt([
  {
    type: 'buttons',
    name: 'action',
    message: 'What to do?',
    choices: [
      {
        title: 'Continue',
        value: 'AskQuestion'
      },
      {
        title: 'Done',
        value: 'Cancel'
      }],
  }
])
  .then((answer) => {
    return answer.action
  });
