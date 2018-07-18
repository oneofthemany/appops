const { Video, Server } = require("../../lib/media");
const WebSocket = require("ws");

Number.prototype.times = function(x) {
  let fn = typeof x == "function" ? x : () => x;
  return Array.from({length: this}).map(fn);
}

describe("Server", () => {
  let v1 = new Video.Builder("t1 video").withURL("/u1-0/video").withPositionMs(10).build();
  let v2 = new Video.Builder("t2 video").withURL("/u2-0/video").withURL("/u2-1/video").withAutoPlay(false).build();

  it("accepts a websocket client", (done) => {
    let srv = new Server(0);
    new WebSocket(`ws://${srv.address().address}:${srv.address().port}`).on("open", () => {
      srv.close();
      done();
    });
  }, 1000)

  it("accepts multiple websocket clients", (done) => {
    let srv = new Server(0);
    let connctr = 0;

    let onopen = () => {
      if (++connctr == 3) {
        srv.close();
        done();
      }
    }

    (3).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`).on("open", onopen));
  }, 1000)

  it("emits init event when new client connects", (done) => {
    let srv = new Server(0);
    let initctr = 0;

    (3).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`));

    srv.on("init", (client) => {
      expect(client).toBeDefined();
      initctr++;
    })

    setTimeout(() => {
      srv.close();
      expect(initctr).toEqual(3);
      done();
    }, 10);
  }, 1000)

  it("can broadcast a message to all clients", (done) => {
    let srv = new Server(0);
    let msgs = [];

    (3).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`)).
      map(client => client.on("message", msgs.push.bind(msgs)));

    setTimeout(() => srv.broadcast("yay", "msg"), 10)
    setTimeout(() => {
      srv.close()
      expect(msgs).toEqual((3).times(JSON.stringify({event: "yay", data: "msg"})));
      done();
    }, 20)
  }, 1000)

  it("only broadcasts to open clients", (done) => {
    let srv = new Server(0);
    let clients = (4).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`));
    let msgs = [];

    clients.forEach(client => client.on("message", msgs.push.bind(msgs)));

    setTimeout(() => srv.broadcast("go", "msg1"), 20)
    setTimeout(() => clients[1].close(), 30)
    setTimeout(() => srv.broadcast("hey", "msg2"), 40)
    setTimeout(() => {
      srv.close();
      let expected = (4).times(JSON.stringify({event: "go", data: "msg1"})).
        concat((3).times(JSON.stringify({event: "hey", data: "msg2"})));
      expect(msgs).toEqual(expected);
      done();
    }, 50)
  }, 1000)

  it("picks only URL from data on send", (done) => {
    let srv = new Server(0);
    let msgs = [];

    new WebSocket(`ws://${srv.address().address}:${srv.address().port}`).
      on("message", msgs.push.bind(msgs));

    setTimeout(() => srv.broadcast("change", v1.toJSON()), 20)
    setTimeout(() => {
      srv.close();
      let expected = JSON.stringify({
        event: "change",
        data: {
          type: "video",
          title: "t1 video",
          positionMs: 10,
          autoPlay: true,
          url: "/u1-0/video"
        }
      });
      expect(msgs).toEqual([expected]);
      done();
    }, 50)
  }, 1000)

  it("picks different URL from data for each client", (done) => {
    let srv = new Server(0);
    let msgs = [];

    (2).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`)).
      map(client => client.on("message", msgs.push.bind(msgs)));

    setTimeout(() => srv.broadcast("change", v2.toJSON()), 20)
    setTimeout(() => {
      srv.close();
      expect(msgs.length).toEqual(2);
      expect(msgs).toContain(JSON.stringify({
        event: "change",
        data: {
          type: "video",
          title: "t2 video",
          positionMs: 0,
          autoPlay: false,
          url: "/u2-0/video"
        }
      }));
      expect(msgs).toContain(JSON.stringify({
        event: "change",
        data: {
          type: "video",
          title: "t2 video",
          positionMs: 0,
          autoPlay: false,
          url: "/u2-1/video"
        }
      }));
      done();
    }, 50)
  }, 1000)

  it("will round-robin through URLs for connected clients", (done) => {
    let srv = new Server(0);
    let msgs = [];

    (3).times(() => new WebSocket(`ws://${srv.address().address}:${srv.address().port}`)).
      map(client => client.on("message", msgs.push.bind(msgs)));

    setTimeout(() => srv.broadcast("change", v2.toJSON()), 20)
    setTimeout(() => {
      srv.close();
      let actualUrls = msgs.map(msg => JSON.parse(msg).data.url)
      expect(actualUrls.length).toBe(3);
      expect(actualUrls.sort()).toEqual(["/u2-0/video", "/u2-0/video", "/u2-1/video"]);
      done();
    }, 50)
  }, 1000)
})
