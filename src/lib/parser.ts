import type { Emoji, Node } from 'slack-message-parser'
import { NodeType, parse as parseEmoji } from 'slack-message-parser'

import type { EmojiFixedNode } from './parser-emoji.js'
import { fixEmojiNodes } from './parser-emoji.js'

export function parse(text: string): EmojiFixedNode {
  return fixAllEmojisRecursively(parseEmoji(text))
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
