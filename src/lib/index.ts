import type { CliOptions } from '../bin'
import { parse, render } from './parser'
import { SlackClient } from './slack'
import { connect, send } from './socket'

export async function main(options: CliOptions) {
  await connect(options.url)

  const slack = SlackClient.create(options.token)

  await slack.prepare()
  await slack.start()

  console.log(JSON.stringify(slack.getStats(), null, 2))

  slack.rtm.on('message', m => {
    if (
      m.subtype ||
      !m.text ||
      (m.channel !== options.channel && slack.channels.get(m.channel) !== options.channel) ||
      (!options.thread && m.thread_ts) ||
      (!options.bot && m.bot_id)
    ) {
      return
    }

    const node = parse(m.text)
    const comment = render(node, slack.channels, slack.users, slack.emojis)

    send(comment)
  })
}
