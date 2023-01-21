#!/usr/bin/env zsh
echo -e "Installing \e[31mai-shell\e[0m in zsh"

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
  echo -e "install node with \e[33mbrew install node\e[0m"
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

touch ~/.zshrc

if ! grep -q "ai-shell integration" ~/.zshrc; then
  PWD=$(pwd)
  {
    echo ""
    echo "# ai-shell integration"
    echo "export AI_SHELL_HOME='$PWD'"
    echo "source $PWD/shell-scripts/ai-zsh.sh"
  } >> ~/.zshrc
fi

npm install
npm link --no-save

echo "================================================================="
echo -e "\e[31mYou need to refresh zsh environment with:\e[0m source ~/.zshrc"
