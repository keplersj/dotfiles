#!/bin/bash

if [ -x "$(command -v zoxide)" ]; then
  eval "$(zoxide init bash)"
  eval "$(zoxide init --cmd cd bash)"
fi
