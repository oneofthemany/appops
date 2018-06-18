const { Video } = require("../../lib/video");

describe("Video.Builder", () => {
  it("requires title to be a string", () => {
    expect(() => { new Video.Builder({}); }).
      toThrowError(/title must be String/);
  })

  it("requires title on build", () => {
    expect(() => { new Video.Builder("").build(); }).
      toThrowError("title length cannot be zero");
  })

  it("requires url to be a string", () => {
    expect(() => { new Video.Builder("t").withURL({}); }).
      toThrowError(`url ${String({})} must be String`);
  })

  it("requires url to have a value", () => {
    expect(() => { new Video.Builder("t").withURL(""); }).
      toThrowError("url length cannot be zero");
  })

  it("accepts multiple urls", () => {
    let video = new Video.Builder("t").withURL("/u1").withURL("/u2").build();
    expect(video.urls).toEqual(["/u1", "/u2"]);
  })

  it("requires urls to have at least one element on build", () => {
    expect(() => { new Video.Builder("t").build(); }).
      toThrowError("provide at least one URL");
  })

  it("requires initial position to be gte to zero", () => {
    expect(() => { new Video.Builder("t").withPositionMs(-1); }).
      toThrowError("inital position cannot be negative");
  })

  it("defaults initPositionMs to zero", () => {
    let video = new Video.Builder("title").withURL("/url").build();
    expect(video.positionMs).toEqual(0);
  })

  it("defaults autoPlay to true", () => {
    let video = new Video.Builder("title").withURL("/url").build();
    expect(video.autoPlay).toEqual(true);
  })

  it("constructs a Video", () => {
    let video = new Video.Builder("title").
      withURL("/url").
      withPositionMs(10).
      withAutoPlay(false).
      build();
    expect(video.title).toEqual("title");
    expect(video.urls).toEqual(["/url"]);
    expect(video.positionMs).toEqual(10);
    expect(video.autoPlay).toEqual(false);
  })
})
