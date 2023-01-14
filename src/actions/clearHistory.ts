import {askAi} from "./aiQuestion";
import {clearHistory} from "../services/fileManagement";

export const onlyClearHistory = (): void => clearHistory();

export const clearHistoryAndRunQuestion = (question: string): void => {
    clearHistory()
    askAi(question)
}