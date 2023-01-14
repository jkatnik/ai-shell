import {saveResultForBashWrapper} from "../util/fileUtil";
import {getLastQuestionFromHistory} from "../util/historyUtil";

const GOOGLE_SEARCH_URL = 'https://www.google.pl/search'

export const openLastQuestionInGoogleFromHistory = () => {
    const question = getLastQuestionFromHistory()
    openInGoogle(question)
}

export const openQuestionInGoogle = (question: string) => openInGoogle(question)

const openInGoogle = (question: string) => {
    const params = new URLSearchParams({q: question}).toString()
    const uri = `${GOOGLE_SEARCH_URL}?${params}`
    const command = `open "${uri}" > /dev/null 2>&1`
    saveResultForBashWrapper(command);
}