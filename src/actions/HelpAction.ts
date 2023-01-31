import { getHome } from '../fileUtils';

const printHelp = (): void => {
  console.log(`Options:
-n - new context, clears history
-g - queries google with last command from history
-q - question mode - have a ChatGTP like conversation 
-h - prints this help

Installation folder: ${getHome()}
`);
};

export default printHelp;
