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
- make it possible to modify proposed command before execution


## Ideas

### Different way of passing command
Maybe we can use standard stdin command forward

Example:

Open terminal 1
```
$ echo $$
296
```
Open terminal 2
```
$ echo -n 'ls -la' >> /proc/296/fd/0
```
Then in the terminal 1 you will see command ls -la
