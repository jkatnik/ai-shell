import { atob, btoa } from 'buffer';
import * as fs from 'fs';
import chalk from 'chalk';


export const getHome = () => process.env.AI_SHELL_HOME;
export const getHistoryPath = () => getHome() + '/ai-history.txt';

export const prepareTextForSave = (text: string) => btoa(text.trim())
export const parseTextFromHistory = (historyEntry: string) => {
  let [type, base64Text ] = historyEntry.split(': ');

  return {
    type,
    text: atob(base64Text).trim(),
    base64Text
  }
}

type CommandType = 'PROCESSING' | 'EXECUTE' | 'AUTOCOMPLETE' | 'ABORTED'
export const saveResultForBashWrapper = (commandType: CommandType, command?: string) => {
  const outFile = getHome() + '/ai-autocomplete.out'
  fs.writeFileSync(outFile, commandType + '\n');
  if (!!command) {
    fs.appendFileSync(outFile, command + '\n');
  }
}

export const clearHistory = (): void => {
  fs.truncateSync(getHistoryPath())
  console.log(chalk.white('History cleared'));
}

export const isXdotoolInstalled = (): boolean => fs.existsSync('/usr/bin/xdotool')
