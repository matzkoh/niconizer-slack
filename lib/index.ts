import { RTMClient } from '@slack/rtm-api'
import { WebClient } from '@slack/web-api'

import { parse, render } from './parser'
import { connect, send } from './socket'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function main(options: any) {
  const rtm = new RTMClient(options.token)
  const web = new WebClient(options.token)

  const channelMap: Record<string, string> = {}
  const userMap: Record<string, string> = {}
  const emojiMap: Record<string, string> = {}

  rtm.on('channel_created', ({ channel }) => {
    channelMap[channel.id] = channel.name
  })

  rtm.on('channel_rename', ({ channel }) => {
    channelMap[channel.id] = channel.name
  })

  rtm.on('channel_deleted', ({ channel }) => {
    delete channelMap[channel]
  })

  rtm.on('team_join', ({ user }) => {
    userMap[user.id] = user.name
  })

  rtm.on('user_change', ({ user }) => {
    userMap[user.id] = user.name
  })

  rtm.on('emoji_changed', ({ subtype, name, value, names }) => {
    if (subtype === 'add') {
      emojiMap[name] = value
    } else if (subtype === 'remove') {
      names.forEach((name: string) => {
        delete emojiMap[name]
      })
    }
  })

  await connect(options.url)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { self, team }: any = await rtm.start()

  const [{ channels }, { members }, { emoji }] = await Promise.all([
    (web.channels.list() as unknown) as Promise<{ channels: Array<{ id: string; name: string }> }>,
    (web.users.list() as unknown) as Promise<{ members: Array<{ id: string; name: string }> }>,
    (web.emoji.list() as unknown) as Promise<{ emoji: Record<string, string> }>,
  ])

  channels.forEach(c => {
    channelMap[c.id] = c.name
  })

  members.forEach(u => {
    userMap[u.id] = u.name
  })

  Object.assign(emojiMap, emoji)

  console.log(
    JSON.stringify(
      {
        team: team.name,
        name: self.name,
        channels: channels.length,
        members: members.length,
        emoji: Object.keys(emojiMap).length,
      },
      null,
      2,
    ),
  )

  rtm.on('message', m => {
    if (
      m.subtype ||
      !m.text ||
      (options.channel && m.channel !== options.channel && channelMap[m.channel] !== options.channel) ||
      (!options.thread && m.thread_ts) ||
      (!options.bot && m.bot_id)
    ) {
      return
    }

    const tree = parse(m.text)
    const comment = render(tree, channelMap, userMap, emojiMap)
    send(comment)
  })
}
