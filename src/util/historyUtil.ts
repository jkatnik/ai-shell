import {atob, btoa} from "buffer";
import fs from "fs";
import {getHistoryPath} from "./fileUtil";

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