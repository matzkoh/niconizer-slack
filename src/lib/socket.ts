import WebSocket from 'ws'

let ws: WebSocket

export async function connect(url: string): Promise<void> {
  await new Promise((resolve, reject) => {
    ws = new WebSocket(url)
    ws.on('error', reject)
    ws.on('open', resolve)
  })
}

export function send(comment: string): void {
  ws.send(comment)
}
