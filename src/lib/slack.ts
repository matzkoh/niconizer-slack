/* eslint-disable
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access,
*/

import { SocketModeClient } from '@slack/socket-mode'
import type { ConversationsListArguments } from '@slack/web-api'
import { WebClient } from '@slack/web-api'

import type { EmojiFixedNode } from './parser-emoji.js'
import { toHtml, toTerminal } from './render.js'

interface Resource {
  id: string
  name: string
}

type Channel = Resource

type User = Resource

interface Emoji {
  name: string
  value: string
}

interface SlackClientOptions {
  token: string
  appToken: string
}

export class SlackClient {
  public channels = new Map<string, string>()
  public users = new Map<string, string>()
  public emojis = new Map<string, string>()

  static create({ token, appToken }: SlackClientOptions) {
    return new SlackClient(new SocketModeClient({ appToken }), new WebClient(token))
  }

  constructor(
    public rtm: SocketModeClient,
    public web: WebClient,
  ) {
    rtm.on('channel_created', ({ channel }) => this.channels.set(channel.id, channel.name))
    rtm.on('channel_rename', ({ channel }) => this.channels.set(channel.id, channel.name))
    rtm.on('channel_deleted', ({ channel }) => this.channels.delete(channel))
    rtm.on('team_join', ({ user }) => this.users.set(user.id, user.name))
    rtm.on('user_change', ({ user }) => this.users.set(user.id, user.name))
    rtm.on('emoji_changed', ({ subtype, name, value, names }) => {
      if (subtype === 'add') {
        this.emojis.set(name, value)
      } else if (subtype === 'remove') {
        names.forEach((name: string) => this.emojis.delete(name))
      }
    })
  }

  getStats() {
    return {
      channels: this.channels.size,
      members: this.users.size,
      emoji: this.emojis.size,
    }
  }

  async prepare() {
    await Promise.all([
      iterateAsync(this.fetchAllConversations(), channel => {
        this.channels.set(channel.id, channel.name)
      }),
      iterateAsync(this.fetchAllUsers(), user => {
        this.users.set(user.id, user.name)
      }),
      iterateAsync(this.fetchAllEmojis(), emoji => {
        this.emojis.set(emoji.name, emoji.value)
      }),
    ])
  }

  async start() {
    await this.rtm.start()

    process.once('SIGINT', () => void this.rtm.disconnect())
  }

  async *fetchAllConversations() {
    const options: ConversationsListArguments = {
      types: 'public_channel,private_channel,mpim,im',
      exclude_archived: true,
      limit: 1000,
    }

    while (true) {
      const { channels, response_metadata: metadata } = await this.web.conversations.list(options)

      yield* channels as Channel[]

      if (!metadata?.next_cursor) {
        break
      }

      options.cursor = metadata?.next_cursor
    }
  }

  async *fetchAllUsers() {
    const { members } = await this.web.users.list({})

    yield* members as User[]
  }

  async *fetchAllEmojis() {
    const { emoji } = await this.web.emoji.list({})

    for (const [name, value] of Object.entries(emoji as Record<string, string>)) {
      yield { name, value } as Emoji
    }
  }

  renderComment(node: EmojiFixedNode) {
    return toHtml(node, this.channels, this.users, this.emojis)
  }

  renderTerminal(node: EmojiFixedNode) {
    return toTerminal(node, this.channels, this.users, this.emojis)
  }
}

async function iterateAsync<T>(gen: AsyncGenerator<T, void, undefined>, fn: (item: T) => void): Promise<void> {
  for await (const item of gen) {
    fn(item)
  }
}

export function getPermalink(channel: string, ts: string, thread_ts?: string) {
  const url = new URL(`https://karakuri-ai.slack.com/archives/${channel}/p${ts.replace(/\D/g, '')}`)

  if (thread_ts) {
    url.searchParams.set('thread_ts', thread_ts)
  }

  return url.href
}
