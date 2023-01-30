import { encode } from 'gpt-3-encoder';
import { loadHistory } from './history';

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
