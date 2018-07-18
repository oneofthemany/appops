const WebSocket = require("ws");
const EventEmitter = require('events');

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
    // FIXME this is a smell
    if ("object" == typeof data && Array.isArray(data.urls)) {
      msg.data = Object.assign({}, data);
      msg.data.url = data.urls[Array.from(this.clients).indexOf(client) % data.urls.length];
      delete msg.data["urls"];
    }
    client.send(JSON.stringify(msg));
  }

  broadcast(evname, data) {
    this.clients.forEach(client => this.send(client, evname, data));
  }
}

module.exports = Server;
