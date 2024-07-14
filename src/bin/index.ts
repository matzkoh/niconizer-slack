#!/usr/bin/env node

import { Command } from 'commander'

import { main } from '../lib/index.js'

export interface CliOptions {
  token: string
  appToken: string
  url: string
  channel?: string
  excludeChannels: string[]
  excludeUsers: string[]
  thread?: boolean
  bot?: boolean
  showUsername?: boolean
  logging?: boolean
}

new Command()
  .requiredOption('-t --token <token>', 'slack bot/user token', process.env.SLACK_TOKEN)
  .requiredOption('-a --app-token <token>', 'slack app token', process.env.SLACK_APP_TOKEN)
  .requiredOption('-u --url <url>', 'websocket server url', 'ws://localhost:25252')
  .option('-c --channel <channel>', 'slack channel name/id to listen')
  .requiredOption('-C --exclude-channels <channel...>', 'slack channel name/id to exclude', [])
  .requiredOption('-U --exclude-users <user...>', 'slack channel name/id to exclude', [])
  .requiredOption('-T --no-thread', 'exclude thread reply', true)
  .requiredOption('-B --no-bot', 'exclude bot user', true)
  .requiredOption('--show-username', 'show username in the message', false)
  .requiredOption('-l --logging', 'enable logging', true)
  .action((options: CliOptions) => main(options).catch(console.error))
  .parse()
