#!/bin/zsh

function ai() {
  EXCHANGE_FILE="$AI_SHELL_HOME/ai-autocomplete.out"
  echo "PROCESSING" > "$EXCHANGE_FILE"

  ai-autocomplete "$@"

  readarray -t RESULT < "$AI_SHELL_HOME/ai-autocomplete.out"
  typeset -a RESULT=("${(@f)"$(<"$EXCHANGE_FILE")"}")

  COMMAND_TYPE="${RESULT[1]}"
  COMMAND="${RESULT[2]}"

  if [ "$COMMAND_TYPE" = "EXECUTING" ]; then
      echo Ups, something went wrong.
  fi

  if [ "$COMMAND_TYPE" = "EXECUTE" ]; then
      eval "$COMMAND"
  fi
}
