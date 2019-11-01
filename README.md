# niconizer-slack

[![CircleCI](https://circleci.com/gh/matzkoh/niconizer-slack.svg?style=shield)](https://circleci.com/gh/matzkoh/niconizer-slack)
[![Renovate](https://badges.renovateapi.com/github/matzkoh/niconizer-slack)](https://renovatebot.com/)
[![npm](https://img.shields.io/npm/v/niconizer-slack.svg)](https://www.npmjs.com/package/niconizer-slack)

## Installation

```bash
$ npm i -g niconizer-slack
```

## Usage

```
Usage: niconizer-slack [options]

Options:
  -u, --url <url>          websocket server url (default: "ws://localhost:25252")
  -t, --token <token>      slack token
  -c, --channel <name|id>  slack channel name/id
  -T, --thread             include thread reply
  -B, --bot                include bot user
  -h, --help               output usage information
```

```bash
$ niconizer-slack -t SLACK_API_TOKEN_HERE
```

[Create and regenerate API tokens](https://get.slack.help/hc/articles/215770388)

The token is required and others are optional.

If no channel was specified, all messages in the authorization scope of the token in the workspace are send to the niconizer.

Press `Ctrl+C` to exit.
