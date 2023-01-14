import path from 'path';
import { atob, btoa } from 'buffer';
import * as fs from 'fs';
import chalk from 'chalk';

export const getHome = () => path.resolve(process.env['HOME'] || process.env['USERPROFILE']);
export const getHistoryPath = () => getHome() + '/.ai-history.txt';


export const saveResultForBashWrapper = (result: string) => fs.writeFileSync('/tmp/ai-autocomplete.out', result);

export const clearHistory = (): void => {
  fs.truncateSync(getHistoryPath())
  console.log(chalk.white('History cleared'));
}
