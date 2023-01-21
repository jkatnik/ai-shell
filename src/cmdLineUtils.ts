import { CmdLineOption } from './types';

export const getCmdLineInput = () => {
  const args = process.argv;
  args.shift(); // first is path to nodejs
  args.shift(); // second is path to the script
  return args.join(' ').trim();
};

export const detectOption = (userInput: string): CmdLineOption => {
  if (userInput.startsWith('-h') || userInput.startsWith('--help')) {
    return CmdLineOption.HELP;
  }

  if (userInput.startsWith('-n') || userInput.startsWith('--new-context')) {
    return CmdLineOption.NEW_CONTEXT;
  }

  if (userInput.startsWith('-g') || userInput.startsWith('--google')) {
    return CmdLineOption.SEARCH_IN_GOOGLE;
  }

  if (userInput.startsWith('-q') || userInput.startsWith('--question')) {
    return CmdLineOption.QUESTION;
  }

  return CmdLineOption.COMMAND;
};
