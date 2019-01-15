import WebSocket from 'ws'

let ws: WebSocket

export function init(url: string) {
  return new Promise(resolve => {
    ws = new WebSocket(url)
    ws.on('open', resolve)
  })
}

export function send(comment: string) {
  ws.send(comment)
}
