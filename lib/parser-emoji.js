const source = require('emoji-datasource');

function findByShortName(name) {
  return name ? source.find(emoji => emoji.short_names.includes(name)) : null;
}

function getUrl(image) {
  return `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-64/${image}`;
}

function fixEmojiNodes(nodes) {
  const result = [];
  const names = nodes.reduce((a, { name, variation }) => (a.push(name, variation), a), []).filter(Boolean);

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const left = findByShortName(name);
    if (left) {
      const variations = left.skin_variations;
      if (variations) {
        const right = findByShortName(names[i + 1]);
        if (right) {
          const variation = variations[right.unified];
          if (variation) {
            result.push({ type: 5, name, variation: right.short_name, image: getUrl(variation.image) });
            i++;
            continue;
          }
        }
      }
      result.push({ type: 5, name, image: getUrl(left.image) });
    } else {
      result.push({ type: 5, name });
    }
  }

  return result;
}

exports.fixEmojiNodes = fixEmojiNodes;
