#!/bin/bash

if [ -x "$(command -v hx)" ]; then
	hx="$(which hx)"
	[ "${EDITOR}" != "code" ] && export EDITOR="${hx}"
	# shellcheck disable=SC2139
	alias suhx="sudo ${hx}"
fi