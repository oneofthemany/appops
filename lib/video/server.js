const WebSocket = require("ws");
const EventEmitter = require('events');
const Video = require('./video.js');

class Server extends WebSocket.Server {
  constructor(port) {
    super({ port: port });
    this.events = new EventEmitter();
    super.on("connection", this.connection.bind(this));
  }

  on(evname, fn) {
    return this.events.on(evname, fn);
  }

  connection(client) {
    this.events.emit("init", client);
  }

  send(client, evname, data) {
    let msg = {event: evname, data: data};
    if (data instanceof Video) {
      msg.data = {
        url: data.urls[Array.from(this.clients).indexOf(client) % data.urls.length],
        position: data.positionMs,
        autoPlay: data.autoPlay
      };
    }
    client.send(JSON.stringify(msg));
  }

  broadcast(evname, data) {
    this.clients.forEach(client => this.send(client, evname, data));
  }
}

module.exports = Server;
