import {OpenAIApi} from "openai";
import chalk from "chalk";
import {saveResultForBashWrapper, saveUserInputInHistory} from "./fileUtil";
import * as oai from "openai";
import {ConfigStore} from "../configStore";
import {countTokens} from "./tokenUtil";
import {buildHistoryContextWithTokenLimit, saveAiOutputInHistory} from "./historyUtil";
import {promptIfUserAcceptsCommand, refineUserInput} from "./promtUtil";

let config = null;

let configStore = new ConfigStore();
const getOpenAiConfig = async () => {
    if (!config) {
        await configStore.load()
        const oaiConfig = new oai.Configuration({
            apiKey: configStore.useNextKey()
        })

        config = new oai.OpenAIApi(oaiConfig)
    }
    return config
}


const askOpenAiWithContext = async (userInput: string, openAi: OpenAIApi): Promise<string> =>  {
    const tokensForResponse = 200
    const currentQuestion = `Write single bash command in one line. Nothing else! ${userInput}.\n`
    const freeTokens = 4000 - tokensForResponse - countTokens(currentQuestion)
    const context = buildHistoryContextWithTokenLimit(freeTokens)

    const prompt = context + currentQuestion
    const completion = await openAi.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0,
        max_tokens: tokensForResponse
    });

    return completion.data.choices[0].text.trim();
}

export const askOpenAi = async (question: string) => {
    const openAiConfig = await getOpenAiConfig();
    let done = false
    let userInput = ''
    try {
        while (!done) {
            const command = await askOpenAiWithContext(question, openAiConfig)
            saveAiOutputInHistory(command)

            console.log(chalk.grey('AI: ') + chalk.greenBright.bold(command))
            const answer = await promptIfUserAcceptsCommand()
            if (answer === 'accept') {
                saveResultForBashWrapper(command)
                done = true
            } else if (answer === 'refine') {
                userInput = await refineUserInput(userInput)
                saveUserInputInHistory(userInput)
            } else {
                saveResultForBashWrapper('aborted');
                done = true
            }
        }
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
    return userInput;
}