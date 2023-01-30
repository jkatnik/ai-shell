import { OpenAIApi } from 'openai';
import prompts from 'prompts';
import * as color from 'kleur';
import { saveAiOutputInHistory, saveUserInputInHistory } from '../history';
import { buildContext, countTokens, printError } from '../OpenAiUtils';
import { UserAction } from '../types';
import { isXdotoolInstalled, saveResultForBashWrapper } from '../fileUtils';
import clearLastLine from '../terminal-utils';
import commandChecker from '../command-checker';

const askOpenAiForCommand = async (userInput: string, openAi: OpenAIApi): Promise<string> => {
  const tokensForResponse = 200;
  const currentQuestion = `Write single bash command in one line. Nothing else! ${userInput}.\n`;

  const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion);
  const context = buildContext(freeTokens);
  const prompt = context + currentQuestion;

  try {
    console.log(color.grey('Waiting for OpenAI ...'));
    const completion = await openAi.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.1,
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

const promptForUserActionAfterCommand = async (): Promise<UserAction> => prompts.prompt([
  {
    type: 'buttons',
    name: 'action',
    message: 'What to do?',

    choices: [
      {
        title: 'Execute',
        value: UserAction.EXECUTE,
        description: 'Exit and execute proposed command.',
      },
      {
        title: 'Type',
        value: UserAction.TYPE,
        disabled: !isXdotoolInstalled(),
        description: 'Exit and type in proposed command but without executing it.',
      },
      {
        title: 'Refine',
        value: UserAction.REFINE,
        description: 'Type in new query to OpenAI.',
      },
      {
        title: 'Abort',
        value: UserAction.CANCEL,
        description: 'Just exit.',
      }],
  },
])
  .then((answer) => answer.action);

const refineUserInput = async (userInput: string): Promise<string> => (await prompts.prompt([{
  type: 'text',
  name: 'userInput',
  message: 'Refine your query:',
  initial: userInput,
}])).userInput;

const handleCommand = async (
  openAi: OpenAIApi,
  userInput: string,
): Promise<void> => {
  let newUserInput = userInput;
  let continueProcessing = true;

  while (continueProcessing) {
    /* eslint-disable no-await-in-loop */
    saveUserInputInHistory(newUserInput);
    const command = await askOpenAiForCommand(newUserInput, openAi);

    const commandToDisplay = `${commandChecker(command)}`;
    console.log(`${color.grey('\nAI: ') + commandToDisplay}\n`);

    const result = await promptForUserActionAfterCommand();

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
      default:
        saveResultForBashWrapper('ABORTED');
        continueProcessing = false;
        break;
    }
  }
};

export default handleCommand;
