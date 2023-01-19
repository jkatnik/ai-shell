# AI-Bash

This project solves following problem:
> I love command line!
> Command line doesn't love me back. 
> It is a difficult relationship.


## Development
Use Node 16 or highier
```
nvm use v16
```

## Installation
1. Create account at https://beta.openai.com/signup
2. [Create new secret key](https://beta.openai.com/account/api-keys) and note it down 
3. Install `xdotool`
    For Ubuntu based distributions:
     ```
    apt install xdotool
    ```
    For MacOS:
    ```
    brew install xdotool
    ```
4. execute installation script
    ```
    ./install.sh
    ```
5. Reload shell functions with
    ```
    source ~/.bash_aliases
    ```
6. have fun
    ```
    ai list files in my home folder 
    ```
## Usage

Basic usage:
```
$ ai list all text files in home dir
```

Reset conversation context and use new one
```
$ ai -n
```

Ask OpenAI a question
```bash
ai -q Who was the best soccer player ever?
```

If OpenAI fails, you can send the last question to google
```
$ ai -g
```


## Materials

- [Build an interactive CLI with Node.js by Hugo Dias](https://opensource.com/article/18/7/node-js-interactive-cli)
- [Build an interactive CLI application with Node.js by Chatthana Janethanakarn](https://medium.com/skilllane/build-an-interactive-cli-application-with-node-js-commander-inquirer-and-mongoose-76dc76c726b6)

## Reference
- [OpenAI JS client](https://github.com/openai/openai-node#readme)
- [why to use `npx link` instead of `npm link`](https://hirok.io/posts/avoid-npm-link)

## Backlog
- refactor
- unit tests
- configStore should check if newly entered API key is valid
- documentation
- prepare a blog post
- add animated GIF demo animation to this README file
- configure license
- make it MacOS compatible
- provide OS and shell version in the prompt context
- -i information (version, file locations, node version, authors, etc) 
- make it possible to modify proposed command before execution
- detect dangerous command and highlight them in red
