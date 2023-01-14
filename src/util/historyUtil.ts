import {atob, btoa} from "buffer";
import fs from "fs";
import {getHistoryPath} from "./fileUtil";
import {countTokens} from "./tokenUtil";

export const prepareTextForSave = (text: string) => btoa(text.trim())
export const parseTextFromHistory = (historyEntry: string) => {
    let [type, base64Text ] = historyEntry.split(': ');

    return {
        type,
        text: atob(base64Text).trim(),
        base64Text
    }
}

export const loadHistory = () => {
    return fs.readFileSync(getHistoryPath(), 'utf8').split('\n')
        .filter(line => line)
        .map(text => parseTextFromHistory(text))
        .filter(entry => entry.text !== '')
}

export const getLastQuestionFromHistory = (): string => {
    const history = loadHistory()
        .filter(entry => entry.type === 'H')

    return history.pop().text;
}

export const saveAiOutputInHistory = (aiOutput: string): void => {
    const text = prepareTextForSave(aiOutput)
    fs.appendFileSync(getHistoryPath(), `AI: ${text}\n`);
}

export const buildHistoryContextWithTokenLimit = (freeTokens: number): string => {
    let context = '';
    let usedTokens = 0;
    const history = loadHistory()
        .map(entry => entry.text)

    // remove current question
    history.pop();

    while (usedTokens < freeTokens && history.length > 0) {
        const entry = history.shift() + '\n\n'
        const tokens = countTokens(entry)
        if (usedTokens + tokens < freeTokens) {
            context += entry
            usedTokens += tokens
        }
    }
    return context
}