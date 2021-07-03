#!/usr/bin/env node

import { Command } from 'commander'

import { main } from '../lib'

export interface CliOptions {
  token: string
  url: string
  channel: string
  thread?: boolean
  bot?: boolean
}

new Command()
  .requiredOption('-t --token <token>', 'slack token')
  .requiredOption('-u --url <url>', 'websocket server url', 'ws://localhost:25252')
  .requiredOption('-c --channel <name|id>', 'slack channel name/id')
  .requiredOption('-T --thread', 'include thread reply', false)
  .requiredOption('-B --bot', 'include bot user', false)
  .action((options: CliOptions) => main(options).catch(console.error))
  .parse()
