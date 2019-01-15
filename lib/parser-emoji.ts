import source from 'emoji-datasource'
import { Emoji } from 'slack-message-parser'

function findByShortName(name: string) {
  return name ? source.find(emoji => emoji.short_names.includes(name)) : null
}

function getUrl(image: string) {
  return `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-64/${image}`
}

export function fixEmojiNodes(nodes: Emoji[]) {
  const result = []
  const names: string[] = []

  nodes.forEach(({ name, variation }) => {
    names.push(name)
    if (variation) {
      names.push(variation)
    }
  })

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const left = findByShortName(name)
    if (left) {
      const variations = left.skin_variations
      if (variations) {
        const right = findByShortName(names[i + 1])
        if (right) {
          const variation = variations[right.unified]
          if (variation) {
            result.push({ type: 5, name, variation: right.short_name, image: getUrl(variation.image) })
            i++
            continue
          }
        }
      }
      result.push({ type: 5, name, image: getUrl(left.image) })
    } else {
      result.push({ type: 5, name })
    }
  }

  return result
}
