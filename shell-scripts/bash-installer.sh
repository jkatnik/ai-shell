#!/usr/bin/env bash
echo -e "Installing \e[31mai-shell\e[0m in bash"

ok() {
  echo -e "\e[32m[OK]\e[0m $1"
}

error() {
  echo -e "\e[31m[ERROR]\e[0m $1"
}

warn() {
  echo -e "\e[33m[WARN]\e[0m $1"
}

if ! [ -x "$(command -v node)" ]; then
  error 'node is not installed.'
  exit 1
else
  ok 'node is present'
fi

# check if node version is >= 16
if [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 16 ]; then
  error 'node version is not >= 16'
  exit 1
else
  ok 'node version is >= 16'
fi

if ! [ -x "$(command -v xdotool)" ]; then
  warn 'xdotool is not installed.'
  echo -e "install xdotool with \e[33mapt install xdotool\e[0m"
else
  ok 'xdotool is present'
fi

touch ~/.bashrc

if ! grep -q "ai-shell integration" ~/.bashrc; then
  PWD=$(pwd)
  {
    echo ""
    echo "# ai-shell integration"
    echo "export AI_SHELL_HOME='$PWD'"
    echo "source $PWD/shell-scripts/ai-bash.sh"
  } >> ~/.bashrc
fi

# check if directory ~/.config/fish/functions exists
if [ -d ~/.config/fish/functions ]; then
    rm ~/.config/fish/functions/ai.fish
    ln -s $PWD/shell-scripts/ai-fish.fish ~/.config/fish/functions/ai.fish
fi


npm install
npm link --no-save

echo "================================================================="
echo -e "\e[31mYou need to refresh bash environment with:\e[0m source ~/.bashrc"
