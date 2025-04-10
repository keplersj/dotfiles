#!/bin/bash

if [ -x "$(command -v eza)" ]; then
	alias ls="eza --icons --hyperlink --git"
fi
