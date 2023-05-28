import type { EmojiDatasource } from 'emoji-datasource'
import source from 'emoji-datasource'
import type { Emoji, Node } from 'slack-message-parser'
import { NodeType } from 'slack-message-parser'

export interface FixedEmoji extends Emoji {
  image?: string
}

export type EmojiFixedNode = Exclude<Node, Emoji> | FixedEmoji

function findByShortName(name: string): EmojiDatasource | undefined {
  return name ? source.find(emoji => emoji.short_names.includes(name)) : undefined
}

function getEmojiUrl(image: string): string {
  return `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-64/${image}`
}

export function fixEmojiNodes(nodes: Emoji[]): FixedEmoji[] {
  const results: FixedEmoji[] = []
  const names: string[] = []
  const source = nodes.map(n => n.source).join('')

  nodes.forEach(({ name, variation }) => {
    names.push(name)

    if (variation) {
      names.push(variation)
    }
  })

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const left = findByShortName(name)
    const result = {
      type: NodeType.Emoji,
      name,
      source,
    } as const

    if (left) {
      const variations = left.skin_variations

      if (variations) {
        const right = findByShortName(names[i + 1])

        if (right) {
          const variation = variations[right.unified]

          if (variation) {
            results.push({
              ...result,
              variation: right.short_name,
              image: getEmojiUrl(variation.image),
            })
            i++

            continue
          }
        }
      }
      results.push({
        ...result,
        image: getEmojiUrl(left.image),
      })
    } else {
      results.push(result)
    }
  }

  return results
}
