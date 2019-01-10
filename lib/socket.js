const WebSocket = require('ws');

let ws;

exports.init = url => {
  return new Promise(resolve => {
    ws = new WebSocket(url);
    ws.on('open', resolve);
  });
};

exports.send = comment => {
  ws.send(comment);
};
