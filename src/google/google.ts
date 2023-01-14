import {saveResultForBashWrapper} from "../util/fileUtil";
import {getLastQuestionFromHistory} from "../util/historyUtil";

export const openLastQuestionInGoogleFromHistory = () => {
    const question = getLastQuestionFromHistory()
    openInGoogle(question)
}

export const openQuestionInGoogle = (question: string) => openInGoogle(question)

const openInGoogle = (question: string) => {
    const params = new URLSearchParams({q: question}).toString()
    const uri = `https://www.google.pl/search?${params}`
    const command = `open "${uri}" > /dev/null 2>&1`
    console.log('command', command)
    saveResultForBashWrapper(command);
}