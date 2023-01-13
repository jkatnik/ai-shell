import path from 'path';
import { atob, btoa } from 'buffer';
import * as fs from 'fs';

export const getHome = () => path.resolve(process.env['HOME'] || process.env['USERPROFILE']);
export const getHistoryPath = () => getHome() + '/.ai-history.txt';

export const prepareTextForSave = (text: string) => btoa(text.trim())
export const parseTextFromHistory = (base64Text: string) => atob(base64Text)

export const saveResultForBashWrapper = (result: string) => fs.writeFileSync('/tmp/ai-autocomplete.out', result);
