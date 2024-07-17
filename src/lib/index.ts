/* eslint-disable
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access,
*/

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

    const url = getPermalink(event.channel, event.ts, event.thread_ts)
    const channelName = slack.channels.get(event.channel)
    const userName = slack.users.get(event.user)

    send(options.showUsername ? `${userName}<br />${comment}` : comment)

    if (options.json) {
      console.log(JSON.stringify({ ts: Math.trunc(event.ts), channel: channelName, user: userName, url, comment }))
    } else if (options.logging) {
      console.log(`#${channelName} @${userName} ${url} ${comment.replace(/\s+/g, '').slice(0, 40)}`)
    }
  })

  await slack.prepare()
  await slack.start()

  if (options.logging) {
    console.log(JSON.stringify(slack.getStats(), undefined, 2))
  }
}
