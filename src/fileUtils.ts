import path from 'path';
import { atob, btoa } from 'buffer';
import * as fs from 'fs';
import chalk from 'chalk';

export const getHome = () => path.resolve(process.env['HOME'] || process.env['USERPROFILE']);
export const getHistoryPath = () => getHome() + '/.ai-history.txt';

export const prepareTextForSave = (text: string) => btoa(text.trim())
export const parseTextFromHistory = (historyEntry: string) => {
  console.log('parseTextFromHistory', historyEntry)
  let [type, base64Text ] = historyEntry.split(': ');

  console.log('result', type, base64Text)

  return {
    type,
    text: atob(base64Text).trim(),
    base64Text
  }
}

export const saveResultForBashWrapper = (result: string) => fs.writeFileSync('/tmp/ai-autocomplete.out', result);

export const clearHistory = (): void => {
  fs.truncateSync(getHistoryPath())
  console.log(chalk.white('History cleared'));
}
