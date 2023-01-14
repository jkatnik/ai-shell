import inquirer from "inquirer";

export const promptIfUserAcceptsCommand = async (): Promise<string> => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'theme',
            message: 'What to do?',
            choices: [
                {
                    name: 'Accept',
                    value: 'accept',
                },
                {
                    name: 'Refine',
                    value: 'refine',
                },
                'Cancel'
            ],
        }
    ])
        .then((answer) => {
            return answer.theme
        });
}


export const refineUserInput = async (userInput: string): Promise<string> => {
    return (await inquirer.prompt([{
        type: 'input',
        name: 'userInput',
        message: 'Refine your query:',
        default: userInput
    }])).userInput
}