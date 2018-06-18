const localdns = require("../../lib/localdns");
const { Resolver } = require('dns');

const PORT = 5321;

describe("localdns", () => {
  var server;
  var resolver = new Resolver();

  beforeAll(() => {
    resolver.setServers(["127.0.0.1:" + PORT]);
  })

  beforeEach(() => {
    server = localdns.NewServer(PORT, "1.2.3.4");
  })

  afterEach(() => {
    server.close();
  })

  it("is not running before start() is called", (done) => {
    resolver.resolve("test.host", (err, records) => {
      expect(err.code).toEqual("ECONNREFUSED");
      expect(records).toBeUndefined();
      done();
    })
  }, 1000)

  it("responds to A query for test.host", (done) => {
    server.start();
    resolver.resolve("test.host", (err, records) => {
      expect(err).toBeNull();
      expect(records).toEqual(["1.2.3.4"]);
      done();
    })
  }, 1000)

  it("responds to A query for any.host", (done) => {
    server.start();
    resolver.resolve("any.host", (err, records) => {
      expect(err).toBeNull();
      expect(records).toEqual(["1.2.3.4"]);
      done();
    })
  }, 1000)

  it("is not running after close() is called", (done) => {
    server.start();
    setTimeout(() => {
      server.close();
      resolver.resolve("test.host", (err, records) => {
        expect(err.code).toEqual("ECONNREFUSED");
        expect(records).toBeUndefined();
        done();
      });
    }, 200)
  }, 1000)

});
