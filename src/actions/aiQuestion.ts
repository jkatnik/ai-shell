import chalk from "chalk";
import {saveResultForBashWrapper, saveUserInputInHistory} from "../services/fileManagement";
import {askOpenAi} from "../services/openAi";

export const askAi = (question: string) => {
    saveUserInputInHistory(question)
    askOpenAi(question).then()
}

export const askAiWithoutQuestion = () => {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('aborted');
}