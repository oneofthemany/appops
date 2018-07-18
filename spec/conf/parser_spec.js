const { Parse } = require("../../lib/conf");
const { Video, Image } = require("../../lib/media");

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
    expect(() => { Parse(conf) }).toThrowError("provide at least one Media instance")
  })

  it("errors when unknown Media type found", () => {
    let conf = [
      { type: "unknown", title: "t1", urls: ["/u1"] }
    ];
    expect(() => { Parse(conf) }).toThrowError("invalid Media type: unknown")
  })

  it("produces valid StateManager with single Video", () => {
    let conf = [
      { type: "video", title: "t1", urls: ["/u1"] }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).toEqual(new Video.Builder("t1").withURL("/u1").build());
  })

  it("produces valid StateManager with single Image", () => {
    let conf = [
      { type: "image", title: "t1", urls: ["/u1"] }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).toEqual(new Image.Builder("t1").withURL("/u1").build());
  })

  it("allows multiple URLs per video", () => {
    let conf = [
      { type: "video", title: "t1", urls: ["/u1", "/u2", "/u3"] }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withURL("/u2").withURL("/u3").build());
  })

  it("allows position to be defined per video", () => {
    let conf = [
      { type: "video", title: "t1", urls: ["/u1"], position: 100 }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withPositionMs(100).build());
  })

  it("allows autoPlay to be defined per video", () => {
    let conf = [
      { type: "video", title: "t1", urls: ["/u1"], position: 200, autoPlay: false }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).
      toEqual(new Video.Builder("t1").withURL("/u1").withPositionMs(200).withAutoPlay(false).build());
  })

  it("allows multiple Videos and Images", () => {
    let conf = [
      { type: "video", title: "t1 video", urls: ["/u1/video"] },
      { type: "video", title: "t2 video", urls: ["/u2/video"] },
      { type: "image", title: "t3 img", urls: ["/u3/img"] }
    ];
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(3);
    expect(vm.media[0]).toEqual(new Video.Builder("t1 video").withURL("/u1/video").build());
    expect(vm.media[1]).toEqual(new Video.Builder("t2 video").withURL("/u2/video").build());
    expect(vm.media[2]).toEqual(new Image.Builder("t3 img").withURL("/u3/img").build());
  })

  it("allows a single Video object as the conf", () => {
    let conf = { type: "video", title: "t1", urls: ["/u1"] };
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).toEqual(new Video.Builder("t1").withURL("/u1").build());
  })

  it("allows a single Image object as the conf", () => {
    let conf = { type: "image", title: "t1", urls: ["/u1"] };
    let vm = Parse(conf);
    expect(vm.media.length).toEqual(1);
    expect(vm.media[0]).toEqual(new Image.Builder("t1").withURL("/u1").build());
  })

});
