import { Emoji, Node, NodeType, parse as parseOrg } from 'slack-message-parser'

import { fixEmojiNodes } from './parser-emoji'

interface FixedEmoji extends Emoji {
  image?: string
}

export function parse(text: string) {
  return fixAllEmoji(parseOrg(text))
}

export function render(
  tree: Node,
  channelMap: Record<string, string>,
  userMap: Record<string, string>,
  emojiMap: Record<string, string>,
) {
  return toHtml(tree, channelMap, userMap, emojiMap).trim()
}

function fixAllEmoji(tree: Node) {
  if ('children' in tree) {
    const { children } = tree
    const arr = []

    for (let i = 0; i < children.length; ) {
      const node = children[i]
      if (node.type === NodeType.Emoji) {
        let endIndex = children.findIndex((node, index) => i < index && node.type !== NodeType.Emoji)
        if (endIndex === -1) {
          endIndex = children.length
        }
        const seq = children.slice(i, endIndex) as Emoji[]
        arr.push(...fixEmojiNodes(seq))
        i = endIndex
      } else {
        arr.push(fixAllEmoji(node))
        i++
      }
    }

    tree.children = arr
  }

  return tree
}

function toHtml(
  node: Node,
  channelMap: Record<string, string>,
  userMap: Record<string, string>,
  emojiMap: Record<string, string>,
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
        : `#${channelMap[node.channelID] || node.channelID}`

    case NodeType.UserLink:
      return node.label
        ? `@${node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')}`
        : `@${userMap[node.userID] || node.userID}`

    case NodeType.URL:
      return node.label ? node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('') : node.url

    case NodeType.Command:
      return node.label
        ? node.label.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')
        : `!${[node.name, ...node.arguments].join(' ')}`

    case NodeType.Emoji: {
      const image = emojiMap[node.name] || (node as FixedEmoji).image
      return image ? `<img class="emoji" src="${image}">` : `:${node.name}:`
    }

    case NodeType.Italic:
    case NodeType.Bold:
    case NodeType.Strike:
    case NodeType.Quote:
    case NodeType.Root:
      return node.children.map(n => toHtml(n, channelMap, userMap, emojiMap)).join('')
  }

  return node
}
