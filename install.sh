if [ $SHELL = "/bin/bash" ]; then
    ./shell-scripts/bash-installer.sh
elif [ $SHELL = "/bin/zsh" ]; then
    ./shell-scripts/zsh-installer.sh
else
    echo "Shell $SHELL not supported"
fi
