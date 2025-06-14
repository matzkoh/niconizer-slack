# niconizer-slack

![test workflow](https://github.com/matzkoh/niconizer-slack/actions/workflows/test.yml/badge.svg)
![release workflow](https://github.com/matzkoh/niconizer-slack/actions/workflows/release.yml/badge.svg)
[![Renovate enabled](https://img.shields.io/badge/Renovate-enabled-brightgreen.svg?logo=renovatebot)](https://renovatebot.com/)
[![npm](https://img.shields.io/npm/v/niconizer-slack.svg)](https://www.npmjs.com/package/niconizer-slack)

## Installation

```bash
$ npm i -g niconizer-slack
```

## Usage

```
Usage: niconizer-slack [options]

Options:
  -t, --token <token>                 slack bot/user token (env: SLACK_TOKEN)
  -a, --app-token <token>             slack app token (env: SLACK_APP_TOKEN)
  -u, --url <url>                     websocket server url (default: "ws://localhost:25252")
  -c, --channel <channel>             slack channel name/id to listen
  -C, --exclude-channels <channel...> slack channel name/id to exclude
  -U, --exclude-users <user...>       slack user name/id to exclude
  -T, --no-thread                     exclude thread reply
  -B, --no-bot                        exclude bot user
  --show-username                     show username in the message
  -L, --no-logging                    disable logging
  -j, --json                          enable json logging
  -h, --help                          output usage information
```

```bash
$ niconizer-slack -t SLACK_API_TOKEN_HERE -a SLACK_APP_TOKEN_HERE
```

[Create and regenerate API tokens](https://get.slack.help/hc/articles/215770388)

Both token (-t) and app-token (-a) are required. Other options are optional.

If no channel was specified, all messages in the authorization scope of the token in the workspace are send to the niconizer.

Press `Ctrl+C` to exit.
