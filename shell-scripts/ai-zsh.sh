#!/bin/bash

function ai() {
  echo "PROCESSING" > "$AI_SHELL_HOME/ai-autocomplete.out"
  history -s "ai $@"
  ai-autocomplete "$@"

  readarray -t RESULT < "$AI_SHELL_HOME/ai-autocomplete.out"
  COMMAND_TYPE="${RESULT[0]}"
  COMMAND="${RESULT[1]}"

  if [ "$COMMAND_TYPE" = "EXECUTING" ]; then
      echo Ups, something went wrong.
  fi

  if [ "$COMMAND_TYPE" = "EXECUTE" ]; then
      eval "$COMMAND"
      history -s $COMMAND
  fi

  if [ "$COMMAND_TYPE" = "AUTOCOMPLETE" ]; then
      # escape quotes in COMMAND
      COMMAND=$(echo $COMMAND | sed 's/"/\\"/g')

      TYPE_COMMAND="sleep 0.1 && osascript -e 'tell application \"System Events\" to keystroke \"$COMMAND\"' &"
      eval "($TYPE_COMMAND)  > /dev/null 2>&1"
  fi
}
