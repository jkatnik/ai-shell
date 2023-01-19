import { saveResultForBashWrapper } from '../fileUtils';
import { getLastQuestionFromHistory } from '../history';

export const searchLatestQueryInGoogle = (userInput: string): string => {
  userInput = userInput.replace('-g', '').trim()

  if (!userInput) {
    userInput = getLastQuestionFromHistory()
  }

  const params = new URLSearchParams({q: userInput}).toString()
  const uri = `https://www.google.pl/search?${params}`
  const command = `open ${uri} > /dev/null 2>&1`

  saveResultForBashWrapper('EXECUTE', command);
  return userInput;
};
