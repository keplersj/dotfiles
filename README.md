# [Kepler](https://keplersj.com)'s Dotfiles

Like any good, [very online](https://www.urbandictionary.com/define.php?term=very%20online), programmer in the 21st century I've been meaning to consolidate and share my [dotfiles](https://en.wikipedia.org/wiki/Hidden_file_and_hidden_directory#Unix_and_Unix-like_environments) on my GitHub. At long last I'll finally be consolidating my config across all of my environments in this repo.

## Software Choices

| Category        | Choice                                                                             |
| --------------- | ---------------------------------------------------------------------------------- |
| Shell           | [zsh](https://www.zsh.org/) + [starship.rs](https://starship.rs/)                  |
| Dotfile Manager | [chezmoi](https://www.chezmoi.io/)                                                 |
| Editor          | [Visual Studio Code](https://code.visualstudio.com/) / [vim](https://www.vim.org/) |

## Environments

This configuration will stretch across this following

### Laptop

I use a Microsoft Surface Laptop 3 (AMD / 15" Version) while commuting to and from work, for day-to-day tasks, and programming. It is configured to dual boot Manjaro Linux and Microsoft Windows. Its Manjaro dotfiles are currently being added to this repository.

### Tablet

I use a Microsoft Surface Go (1st Generation) for general day-to-day tasks and media consumption. It is configured to dual boot Manjaro Linux and Microsoft Windows. Its dotfiles will be documented in this repository.

### Desktop

My desktop is primarily used for gaming with the occasional programming and other miscellaneous. It is configured to dual boot Manjaro Linux and Microsoft Windows.

## Retired Environments

### 2015 MacBook Pro 15"

My 2015 MacBook Pro 15" is configured to dual-boot Manjaro Linux and macOS. The dotfiles from both environments will be documented in this repository.

## Installation

Use `chezmoi`'s configuration applier one-liner to apply this configuration to your environment:

```sh
$ sh -c "$(curl -fsLS git.io/chezmoi)" -- init --apply keplersj
```
