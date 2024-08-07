import chalk from 'chalk'
import { NodeType } from 'slack-message-parser'
import link from 'terminal-link'

import type { EmojiFixedNode } from './parser-emoji.js'

export function toHtml(
  node: EmojiFixedNode,
  channelMap: Map<string, string>,
  userMap: Map<string, string>,
  emojiMap: Map<string, string>,
): string {
  switch (node.type) {
    case NodeType.Text:
    case NodeType.PreText:
      return node.text

    case NodeType.Code:
      return `${node.text}\n`

    case NodeType.ChannelLink:
      return node.label
        ? `#${node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')}`
        : `#${channelMap.get(node.channelID) ?? node.channelID}`

    case NodeType.UserLink:
      return node.label
        ? `@${node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')}`
        : `@${userMap.get(node.userID) ?? node.userID}`

    case NodeType.URL:
      return node.label ? node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('') : node.url

    case NodeType.Command:
      return node.label
        ? node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')
        : `!${[node.name, ...node.arguments].join(' ')}`

    case NodeType.Emoji: {
      const image = emojiMap.get(node.name) ?? node.image

      return image ? `<img class="emoji" src="${image}">` : `:${node.name}:`
    }

    case NodeType.Italic:
    case NodeType.Bold:
    case NodeType.Strike:
    case NodeType.Quote:
    case NodeType.Root:
      return node.children.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')
  }
}

export function toTerminal(
  node: EmojiFixedNode,
  channelMap: Map<string, string>,
  userMap: Map<string, string>,
  emojiMap: Map<string, string>,
): string {
  switch (node.type) {
    case NodeType.Text:
    case NodeType.PreText:
    case NodeType.Code:
      return node.text

    case NodeType.ChannelLink:
      return chalk.blue(
        node.label
          ? `#${node.label.map(n => toTerminal(n, channelMap, userMap, emojiMap)).join('')}`
          : `#${channelMap.get(node.channelID) ?? node.channelID}`,
      )

    case NodeType.UserLink:
      return chalk.blue(
        node.label
          ? `@${node.label.map(n => toTerminal(n, channelMap, userMap, emojiMap)).join('')}`
          : `@${userMap.get(node.userID) ?? node.userID}`,
      )

    case NodeType.URL:
      return chalk.blue(
        link(
          node.label
            ? node.label.map(n => toTerminal(n, channelMap, userMap, emojiMap)).join('')
            : new URL(node.url).hostname,
          node.url,
        ),
      )

    case NodeType.Command:
      return node.label
        ? node.label.map(n => toTerminal(n, channelMap, userMap, emojiMap)).join('')
        : `!${[node.name, ...node.arguments].join(' ')}`

    case NodeType.Emoji:
      return `:${node.name}:`

    case NodeType.Italic:
    case NodeType.Bold:
    case NodeType.Strike:
    case NodeType.Quote:
    case NodeType.Root:
      return node.children.map(n => toTerminal(n, channelMap, userMap, emojiMap)).join('')
  }
}
