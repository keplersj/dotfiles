#!/bin/bash

if [ -x "$( command -v gh )" ]; then
    eval "$(gh completion -s bash)"
    # eval "$(gh copilot alias bash)"
fi
