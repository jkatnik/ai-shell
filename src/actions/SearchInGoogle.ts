import { saveResultForBashWrapper } from '../fileUtils';
import { getLastQuestionFromHistory } from '../history';

const searchLatestQueryInGoogle = (userQuery: string): void => {
  const userInput = userQuery!! ? userQuery : getLastQuestionFromHistory();

  const params = new URLSearchParams({ q: userInput }).toString();
  const uri = `https://www.google.pl/search?${params}`;
  const command = `open ${uri} > /dev/null 2>&1`;

  saveResultForBashWrapper('EXECUTE', command);
};

export default searchLatestQueryInGoogle;
