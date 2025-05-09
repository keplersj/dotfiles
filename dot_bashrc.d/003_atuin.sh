#!/bin/bash

if [ -x "$(command -v atuin)" ]; then
    eval "$(atuin init bash)"
fi