import fs from 'fs';
import { getHistoryPath, parseTextFromHistory, prepareTextForSave } from './fileUtils';

export const saveUserInputInHistory = (userInput: string): void => {
  const text = prepareTextForSave(userInput);
  fs.appendFileSync(getHistoryPath(), `H: ${text}\n`);
};

export const saveAiOutputInHistory = (aiOutput: string): void => {
  const text = prepareTextForSave(aiOutput);
  fs.appendFileSync(getHistoryPath(), `AI: ${text}\n`);
};

export const loadHistory = () => fs.readFileSync(getHistoryPath(), 'utf8').split('\n')
  .filter((text) => text)
  .map((text) => parseTextFromHistory(text))
  .filter((entry) => entry.text !== '');

export const getLastQuestionFromHistory = (): string => {
  const history = loadHistory()
    .filter((entry) => entry.type === 'H');

  return history.pop().text;
};
