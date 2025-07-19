# niconizer-slack

![test workflow](https://github.com/matzkoh/niconizer-slack/actions/workflows/test.yml/badge.svg)
![release workflow](https://github.com/matzkoh/niconizer-slack/actions/workflows/release.yml/badge.svg)
[![Renovate enabled](https://img.shields.io/badge/Renovate-enabled-brightgreen.svg?logo=renovatebot)](https://renovatebot.com/)
[![npm](https://img.shields.io/npm/v/niconizer-slack.svg)](https://www.npmjs.com/package/niconizer-slack)

## Installation

```bash
$ npm i -g niconizer-slack
```

## Slack App Setup

To use niconizer-slack, you need to create a Slack App. You can use the provided manifest file to quickly set up the app:

1. Go to [Slack API: Your Apps](https://api.slack.com/apps) and click "Create New App"
2. Choose "From an app manifest"
3. Select your workspace
4. Copy the contents of `niconizer-slack-manifest.json` and paste it into the JSON tab
5. Review and create the app
6. After creation, go to "OAuth & Permissions" and install the app to your workspace
7. Copy the "Bot User OAuth Token" (starts with `xoxb-`) - this is your `-t/--token`
8. Go to "Basic Information" > "App-Level Tokens" and create a token with `connections:write` scope
9. Copy this token (starts with `xapp-`) - this is your `-a/--app-token`

The manifest configures the app with:
- Socket Mode enabled (required for the app)
- All necessary bot scopes for reading messages and user information
- Event subscriptions for message and emoji changes

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


Both token (-t) and app-token (-a) are required. Other options are optional.

If no channel was specified, all messages in the authorization scope of the token in the workspace are send to the niconizer.

Press `Ctrl+C` to exit.
