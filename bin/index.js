#!/usr/bin/env node

const program = require('commander');
const { main } = require('../lib');

program
  .option('-u, --url <url>', 'websocket server url', 'ws://localhost:25252')
  .option('-t, --token <token>', 'slack token')
  .option('-c, --channel <name|id>', 'slack channel name/id')
  .option('-T, --thread', 'include thread reply', false)
  .option('-B, --bot', 'include bot user', false)
  .action(main)
  .parse(process.argv);
