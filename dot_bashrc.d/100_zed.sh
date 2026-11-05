#!/bin/bash

# Zed comes from the system Flatpak (dev.zed.Zed). Inside a distrobox,
# reach the host's Flatpak through distrobox-host-exec.
if [ -f /run/.containerenv ] && [ -x "$(command -v distrobox-host-exec)" ]; then
	alias zed="distrobox-host-exec flatpak run dev.zed.Zed"
elif [ -x "$(command -v flatpak)" ]; then
	alias zed="flatpak run dev.zed.Zed"
fi
