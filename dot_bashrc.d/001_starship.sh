#!/bin/bash

if [ -x "$( command -v starship )" ]; then
    eval "$(starship init bash)"
fi