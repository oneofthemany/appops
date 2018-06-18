const { Parse } = require("../../lib/conf");
const { Video } = require("../../lib/video");

describe("Parse", () => {
  it("errors when passing no args", () => {
    expect(() => { Parse() }).toThrowError("invalid arguments")
  })

  it("errors when passing null arg", () => {
    expect(() => { Parse(null) }).toThrowError("invalid arguments")
  })

  it("errors when passing more than one arg", () => {
    expect(() => { Parse({}, {}) }).toThrowError("invalid arguments")
  })

  it("errors when conf is empty array", () => {
    let conf = [];
    expect(() => { Parse(conf) }).toThrowError("provide at least one Video")
  })

  it("produces valid StateManager with single Video", () => {
    let conf = [
      { title: "t1", urls: ["/u1"] }
    ];
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(1);
    expect(vm.videos[0]).toEqual(new Video.Builder("t1").withURL("/u1").build());
  })

  it("allows multiple URLs per video", () => {
    let conf = [
      { title: "t1", urls: ["/u1", "/u2", "/u3"] }
    ];
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(1);
    expect(vm.videos[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withURL("/u2").withURL("/u3").build());
  })

  it("allows position to be defined per video", () => {
    let conf = [
      { title: "t1", urls: ["/u1"], position: 100 }
    ];
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(1);
    expect(vm.videos[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withPositionMs(100).build());
  })

  it("allows autoPlay to be defined per video", () => {
    let conf = [
      { title: "t1", urls: ["/u1"], position: 200, autoPlay: false }
    ];
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(1);
    expect(vm.videos[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withPositionMs(200).withAutoPlay(false).build());
  })

  it("allows multiple Videos", () => {
    let conf = [
      { title: "t1", urls: ["/u1"] },
      { title: "t2", urls: ["/u2"] },
      { title: "t3", urls: ["/u3"] }
    ];
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(3);
    expect(vm.videos[0]).toEqual(new Video.Builder("t1").withURL("/u1").build());
    expect(vm.videos[1]).toEqual(new Video.Builder("t2").withURL("/u2").build());
    expect(vm.videos[2]).toEqual(new Video.Builder("t3").withURL("/u3").build());
  })

  it("allows a single Video object as the conf", () => {
    let conf = { title: "t1", urls: ["/u1"] };
    let vm = Parse(conf);
    expect(vm.videos.length).toEqual(1);
    expect(vm.videos[0]).toEqual(new Video.Builder("t1").withURL("/u1").build());
  })

});
