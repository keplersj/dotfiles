#!/bin/bash

if type brew &>/dev/null
then
brew bundle --file=/dev/stdin <<EOF
# Chezmoi should already be installed by this point,
# but by explicitly installing it here, we ensure that
# Homebrew is able to keep it up to date.
brew "chezmoi"

# Prompt
brew "atuin"
brew "starship"

# Filesystem
brew "bat"
brew "eza"
brew "helix"
EOF
fi