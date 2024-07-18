/* eslint-disable
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access,
*/

import chalk from 'chalk'
import truncate from 'cli-truncate'
import link from 'terminal-link'

import type { CliOptions } from '../bin/index.js'

import { parse } from './parser.js'
import { SlackClient, getPermalink } from './slack.js'
import { connect, send } from './socket.js'

export async function main(options: CliOptions) {
  await connect(options.url)

  const slack = SlackClient.create({
    token: options.token,
    appToken: options.appToken,
  })

  slack.rtm.on('message', ({ ack, event }) => {
    if (typeof ack !== 'function') {
      return
    }

    void ack()

    if (
      event.subtype ||
      !event.text ||
      (options.channel && event.channel !== options.channel) ||
      (options.channel && slack.channels.get(event.channel) !== options.channel) ||
      options.excludeChannels.includes(event.channel) ||
      options.excludeChannels.includes(slack.channels.get(event.channel)!) ||
      options.excludeUsers.includes(event.user) ||
      options.excludeUsers.includes(slack.users.get(event.user)!) ||
      (!options.thread && event.thread_ts) ||
      (!options.bot && event.bot_id)
    ) {
      return
    }

    const node = parse(event.text)
    const comment = slack.renderComment(node)

    if (!comment) {
      return
    }

    const formattedTs = intl.format(event.ts * 1000)
    const url = getPermalink(event.channel, event.ts, event.thread_ts)
    const channelName = slack.channels.get(event.channel) ?? String(event.channel)
    const userName = slack.users.get(event.user) ?? String(event.user)

    send(options.showUsername ? `${userName}<br />${comment}` : comment)

    if (!options.logging) {
      return
    }

    console.log(
      options.json
        ? JSON.stringify({
            ts: Math.trunc(event.ts * 1000),
            channel: channelName,
            user: userName,
            url,
            comment,
          })
        : [
            chalk.yellow(link(formattedTs, url)),
            chalk.magenta(channelName),
            chalk.green(userName),
            truncate(
              slack.renderTerminal(node).replaceAll(/\s+/g, ' ').trim(),
              (process.stdout.columns || 80) - (formattedTs.length + channelName.length + userName.length + 3),
            ),
          ].join(' '),
    )
  })

  await slack.prepare()
  await slack.start()

  if (options.logging) {
    process.stderr.write(JSON.stringify(slack.getStats()) + '\n')
  }
}

const intl = new Intl.DateTimeFormat('ja-JP', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
