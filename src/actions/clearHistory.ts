import {askAi} from "./aiQuestion";
import {clearHistory} from "../util/fileUtil";

export const onlyClearHistory = (): void => clearHistory();

export const clearHistoryAndRunQuestion = (question: string): void => {
    clearHistory()
    askAi(question)
}