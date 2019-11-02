#!/usr/bin/env node

import program from 'commander'

import { main } from '../lib'

program
  .requiredOption('-t, --token <token>', 'slack token')
  .option('-u, --url <url>', 'websocket server url', 'ws://localhost:25252')
  .option('-c, --channel <name|id>', 'slack channel name/id')
  .option('-T, --thread', 'include thread reply', false)
  .option('-B, --bot', 'include bot user', false)
  .action(main)
  .parse(process.argv)
