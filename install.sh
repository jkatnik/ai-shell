#!/bin/bash

npm install
#npm link --no-save
npx link .

# check if "ai" function exists, create it if it doesn't
if [ -z "$(type -t ai)" ]; then
    # create foo function and save it to ~/.bash_aliases
    cat './src/ai-function.txt' >> ~/.bashrc
    echo "alias ai-autocomplete='node ~/ai/dist/ai.js'" >> ~/.bashrc
    source ~/.bashrc
    echo "Reload bash aliases with: source ~/.bash_aliases"
fi
