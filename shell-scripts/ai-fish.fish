function ai --description 'Autocompletion for AI Shell'
  echo "PROCESSING" > "$AI_SHELL_HOME/ai-autocomplete.out"
  ai-autocomplete $argv

  set -l RESULT (cat "$AI_SHELL_HOME/ai-autocomplete.out")
  set -l COMMAND_TYPE $RESULT[1]
  set -l COMMAND $RESULT[2]

  if [ "$COMMAND_TYPE" = "EXECUTING" ]
    echo Ups, something went wrong.
  end

  if [ "$COMMAND_TYPE" = "EXECUTE" ]
    eval $COMMAND
  end

  if [ "$COMMAND_TYPE" = "AUTOCOMPLETE" ]
    # escape quotes in COMMAND
    set COMMAND (echo $COMMAND | sed 's/"/\\"/g')

    set TYPE_COMMAND (printf 'sleep 0.1 && xdotool type --delay 0 "%s" &' $COMMAND)
    eval $TYPE_COMMAND > /dev/null 2>&1
  end
end
