const { Video, StateManager } = require("../../lib/video");

describe("StateManager", () => {
  let v1 = new Video.Builder("t1").withURL("/u1").build();
  let v2 = new Video.Builder("t2").withURL("/u2").build();
  let v3 = new Video.Builder("t3").withURL("/u3").build();

  describe("Builder", () => {
    it("withVideo expects only Video instances", () => {
      expect(() => { new StateManager.Builder().withVideo("v1"); }).
        toThrowError("v1 must be of type Video");
    })

    it("requires at least one Video on build", () => {
      expect(() => { new StateManager.Builder().build(); }).
        toThrowError("provide at least one Video");
    })

    it("builds a StateManager", () => {
      let smgr = new StateManager.Builder().withVideo(v1).withVideo(v2).build();
      expect(smgr.videos).toEqual([v1, v2]);
    })
  })

  it("emits change event when current video switched", (done) => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withVideo(v3).
      build();

    smgr.on("change", (video) => {
      expect(video).toEqual(v2);
      done();
    })

    expect(smgr.changeByTitle(v2.title)).toBe(true);
  }, 100)

  it("emits no change event if no video for title", (done) => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withVideo(v3).
      build();

    setTimeout(done, 100);

    smgr.on("change", (video) => {
      fail("nothing should have changed");
    })

    expect(smgr.changeByTitle("no-title")).toBe(false);
  })

  it("returns an array of titles", () => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withVideo(v3).
      build();

    expect(smgr.titles()).toEqual([v1.title, v2.title, v3.title]);
  })

  it("tracks current video through change", () => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withVideo(v3).
      build();

    expect(smgr.video()).toEqual(v1);
    expect(smgr.changeByTitle(v3.title)).toBe(true);
    expect(smgr.video()).toEqual(v3);
  })

  it("does not change current video if attempt to change fails", () => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withVideo(v3).
      build();

    expect(smgr.video()).toEqual(v1);
    expect(smgr.changeByTitle("no-title")).toBe(false);
    expect(smgr.video()).toEqual(v1);
  })
})
