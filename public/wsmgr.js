// WebSocketManager tries very hard to keep an open connection to a server.
// To change how long the manager waits between restart attempts, provide the
// `restartDelayMs` options. Default is 5 seconds between restart attempts.
// Forcing a restart attempt will cancel out any current attempt.
//
// In addition, WebSocketManager will periodically ping the server to keep
// the connection alive. By default, the ping interval is 45 seconds. This
// can be changed by setting the `pingIntervalMs` option manually.
class WebSocketManager {
  constructor(url, options) {
    this.waitingForRestartId = 0;
    this.pingIntervalId = 0;
    this.ws = null;
    this.msgFns = [];

    let opts = Object.assign({
      restartDelayMs: 5000,
      pingIntervalMs: 45000
    }, options || {});

    this.url = url;
    this.restartDelayMs = opts.restartDelayMs;
    this.pingIntervalMs = opts.pingIntervalMs;
  }

  Start(msgFn) {
    if (msgFn) {
      this.msgFns.push(msgFn);
    }

    if (this.ws && this.ws.readyState < WebSocket.CLOSING) {
      throw "WebSocketManager: can't start a WebSocket that isn't closing";
    } else if (this.waitingForRestartId > 0) {
      // if closed but waiting for restart, clear out current cycle
      this.Close();
    }
    this.ws = new WebSocket(this.url);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);

    this.pingIntervalId = setInterval(this.Ping.bind(this), this.pingIntervalMs);
  }

  Ping() {
    this.Send('{"event":"ping"}');
  }

  Restart() {
    console.log("WebSocketManager: restart attempt");
    this.Close();
    this.Start();
  }

  Close() {
    console.log("WebSocketManager: closing connection");

    this.clearAsyncDelays();

    // remove any event listeners before closing
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
  }

  Send(msg) {
    if (this.IsOpen()) {
      this.ws.send(msg);
    } else {
      // yes, we are swallowing this for now
      console.log("WebSocketManager: connection is not open");
    }
  }

  IsOpen() {
    return this.ws && this.ws.readyState == WebSocket.OPEN;
  }

  // clear any existing restart timeouts and pings
  clearAsyncDelays() {
    clearTimeout(this.waitingForRestartId);
    this.waitingForRestartId = 0;
    clearInterval(this.pingIntervalId);
    this.pingIntervalId = 0;
  }

  onOpen(ev) {
    console.log("WebSocketManager: connected");
  }

  onMessage(ev) {
    console.log("WebSocketManager: data:", ev.data);
    this.msgFns.forEach(function each(fn) {
      fn(ev.data);
    });
  }

  onClose(ev) {
    console.log("WebSocketManager: disconnected:", ev.code);
    console.log("WebSocketManager: wait %d ms and attempt restart", this.restartDelayMs);

    // only restart if we still have a websocket client and we're not open or connecting
    new Promise(next => {
      this.waitingForRestartId = setTimeout(next.bind(this), this.restartDelayMs);
    }).then(() => {
      this.waitingForRestartId = 0;
      if (this.ws && this.ws.readyState > WebSocket.OPEN) {
        this.Restart();
      }
    });
  }

  onError(ev) {
    console.log("WebSocketManager: error: readyState =", this.ws ? this.ws.readyState : "NULL");
  }
}
