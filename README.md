# AI-Bash

## Development
Use Node 18.x
```
nvm use v18
```

## Installation
```
./install.sh
```

## Usage

Basic usage:
```
$ ai list tall text files in home dir
```

Reset conversation context and use new one
```
$ ai -n
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
- "query" mode
- -i information (version, file locations, node version, authors, etc) 
- make it possible to modify proposed command before execution
- detect dangerous command and highlight them in red

## Known problems

1. `$ ai zmień nazwę brancha na test`
   fails with:
   ```
   node:internal/util:493
   return new DOMException(message, name);
   
   DOMException [InvalidCharacterError]: Invalid character
    at btoa (node:buffer:1228:13)
    at prepareTextForSave (/home/jkatnik/www/ai/dist/fileUtils.js:38:56)
    at saveUserInputInHistory (/home/jkatnik/www/ai/dist/ai.js:97:53)
    at run (/home/jkatnik/www/ai/dist/ai.js:76:5)
    at /home/jkatnik/www/ai/dist/ai.js:217:5
   ```
