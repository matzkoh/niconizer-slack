import { Emoji, Node, NodeType, parse as parseOrg } from 'slack-message-parser'

import { EmojiFixedNode, fixEmojiNodes } from './parser-emoji'

export function parse(text: string): EmojiFixedNode {
  return fixAllEmojisRecursively(parseOrg(text))
}

export function render(
  node: EmojiFixedNode,
  channelMap: Map<string, string>,
  userMap: Map<string, string>,
  emojiMap: Map<string, string>,
): string {
  return toHtml(node, channelMap, userMap, emojiMap).trim()
}

function fixAllEmojisRecursively(node: Node): EmojiFixedNode {
  if ('children' in node) {
    const { children } = node
    const arr: EmojiFixedNode[] = []

    for (let i = 0; i < children.length; ) {
      const node = children[i]

      if (node.type === NodeType.Emoji) {
        let endIndex = children.findIndex((child, index) => i < index && child.type !== NodeType.Emoji)

        if (endIndex === -1) {
          endIndex = children.length
        }

        const seq = children.slice(i, endIndex) as Emoji[]
        arr.push(...fixEmojiNodes(seq))
        i = endIndex
      } else {
        arr.push(fixAllEmojisRecursively(node))
        i++
      }
    }

    node.children = arr
  }

  return node
}

function toHtml(
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
