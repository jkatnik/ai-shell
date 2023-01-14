import chalk from "chalk";
import {saveResultForBashWrapper, saveUserInputInHistory} from "../util/fileUtil";
import {askOpenAi} from "../util/aiUtil";

export const askAi = (question: string) => {
    saveUserInputInHistory(question)
    askOpenAi(question).then()
}

export const askAiWithoutQuestion = () => {
    console.log(chalk.yellow('No input provided'));
    saveResultForBashWrapper('aborted');
}