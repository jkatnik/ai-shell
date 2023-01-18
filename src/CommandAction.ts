import { OpenAIApi } from 'openai';
import { saveAiOutputInHistory } from './history';
import { buildContext, countTokens } from './OpenAiUtils';
import { UserAction } from './types';
import prompts from 'prompts';
import { isXdotoolInstalled } from './fileUtils';

export const askOpenAiForCommand = async (userInput: string, openAi: OpenAIApi): Promise<string> => {
  const tokensForResponse = 200
  const currentQuestion = `Write single bash command in one line. Nothing else! ${userInput}.\n`;

  const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion)
  const context = buildContext(freeTokens)
  const prompt = context + currentQuestion

  const completion = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0,
    max_tokens: tokensForResponse
  });

  const command = completion.data.choices[0].text.trim();

  saveAiOutputInHistory(command)

  return command;
}

export const promptForUserActionAfterCommand = async (): Promise<UserAction> => prompts.prompt([
  {
    type: 'buttons',
    name: 'action',
    message: 'What to do?',
    choices: [
      {
        title: 'Execute',
        value: 'Execute'
      },
      {
        title: 'Type',
        value: 'Type',
        disabled: !isXdotoolInstalled()
      },
      {
        title: 'Refine',
        value: 'Refine'
      },
      {
        title: 'Cancel',
        value: 'Cancel'
      }],
  }
])
  .then((answer) => {
    return answer.action
  });
