#!/usr/bin/env node

import chalk from 'chalk'
import { ConfigStore } from './configStore'
import * as oai from 'openai'
import { exec } from 'child_process'
import inquirer from 'inquirer'

async function run() {
  promptExample()

  let configStore = new ConfigStore()
  const oaiConfig = new oai.Configuration({
    apiKey: configStore.useNextKey()
  })

  const openAi = new oai.OpenAIApi(oaiConfig)
  let userInput = getCmdLineInput()
  // debug(`user input: ${userInput}`)

  try {
    const completion = await openAi.createCompletion({
      model: "text-davinci-003",
      prompt: `Write single bash command. Nothing else! ${userInput}`,
    });
    const command = completion.data.choices[0].text.trim()
    execute(command)
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }

  configStore.save()
}

function getCmdLineInput() {
  let args = process.argv
  args.shift() // firts is path to nodejs
  args.shift() // second is path to the script
  return args.join(' ')
}

function debug(text: String) {
  console.debug(text)
}

function execute(command: string) {
  debug(command)
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log(`> ${command}`)
      console.log(chalk.red.bold(stderr))
    } else {
      console.log(stdout)
    }
  })
}

async function promptExample() {
  inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'What to do?',
        choices: [
          '[E]xecute',
          'Abort',
          'Just type - don\'t execute',
          'Extend input'
        ],
      }
    ])
    .then((answers) => {
      console.log(JSON.stringify(answers, null, '  '));
    });
}

run()
