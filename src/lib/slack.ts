/* eslint-disable
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-argument,
*/

import { RTMClient } from '@slack/rtm-api'
import type { ConversationsListArguments } from '@slack/web-api'
import { WebClient } from '@slack/web-api'

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

export class SlackClient {
  public channels = new Map<string, string>()
  public users = new Map<string, string>()
  public emojis = new Map<string, string>()

  public teamName: string | undefined
  public selfName: string | undefined

  static create(token: string) {
    return new SlackClient(new RTMClient(token), new WebClient(token))
  }

  constructor(public rtm: RTMClient, public web: WebClient) {
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
      team: this.teamName,
      name: this.selfName,
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
    const { self, team } = await this.rtm.start()

    if (hasName(self)) {
      this.selfName = self.name
    }

    if (hasName(team)) {
      this.teamName = team.name
    }
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
    const { members } = await this.web.users.list()

    yield* members as User[]
  }

  async *fetchAllEmojis() {
    const { emoji } = await this.web.emoji.list()

    for (const [name, value] of Object.entries(emoji as Record<string, string>)) {
      yield { name, value } as Emoji
    }
  }
}

async function iterateAsync<T>(gen: AsyncGenerator<T, void, undefined>, fn: (item: T) => void): Promise<void> {
  for await (const item of gen) {
    fn(item)
  }
}

function hasName(obj: unknown): obj is { name: string } {
  return typeof (obj as { name: string } | undefined)?.name === 'string'
}
