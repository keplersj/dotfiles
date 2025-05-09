#!/bin/bash

# Make the experience with starship less overlapping
if [ -x "$(command -v starship)" ]; then
  # Out of the box starship will color the prompt depending on the previous exit code
  # Additionally, with the status module enabled starship increases exit code verbosity
  bleopt exec_errexit_mark=''
fi

# Disable the exit output
bleopt exec_exit_mark=''
