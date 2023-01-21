import { saveResultForBashWrapper } from '../fileUtils';
import { getLastQuestionFromHistory } from '../history';

const searchLatestQueryInGoogle = (userInputWithFlag: string): string => {
  const userInput = userInputWithFlag.replace('-g', '').trim() || getLastQuestionFromHistory();

  const params = new URLSearchParams({ q: userInput }).toString();
  const uri = `https://www.google.pl/search?${params}`;
  const command = `open ${uri} > /dev/null 2>&1`;

  saveResultForBashWrapper('EXECUTE', command);
  return userInput;
};

export default searchLatestQueryInGoogle;
