const { Video, Image, StateManager } = require("../../lib/media");

describe("StateManager", () => {
  let v1 = new Video.Builder("t1 video").withURL("/u1/video").build();
  let v2 = new Video.Builder("t2 video").withURL("/u2/video").build();
  let v3 = new Video.Builder("t3 video").withURL("/u3/video").build();

  let i1 = new Image.Builder("t1 img").withURL("/u1/img").build();
  let i2 = new Image.Builder("t2 img").withURL("/u2/img").build();
  let i3 = new Image.Builder("t3 img").withURL("/u3/img").build();

  describe("Builder", () => {
    it("withVideo expects only Video instances", () => {
      expect(() => { new StateManager.Builder().withVideo(i1); }).
        toThrowError("[object Object] must be of type Video");
    })

    it("withImage expects only Image instances", () => {
      expect(() => { new StateManager.Builder().withImage(v1); }).
        toThrowError("[object Object] must be of type Image");
    })

    it("requires at least one media instance on build", () => {
      expect(() => { new StateManager.Builder().build(); }).
        toThrowError("provide at least one Media instance");
    })

    it("builds a StateManager", () => {
      let smgr = new StateManager.Builder().withVideo(v1).withVideo(v2).build();
      expect(smgr.media).toEqual([v1, v2]);
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

  it("emits no change event if no media for title", (done) => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withImage(i2).withVideo(v3).
      build();

    setTimeout(done, 100);

    smgr.on("change", (video) => {
      fail("nothing should have changed");
    })

    expect(smgr.changeByTitle("no-title")).toBe(false);
  })

  it("returns an array of titles", () => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withImage(i1).withVideo(v3).
      build();

    expect(smgr.titles()).toEqual([v1.title, i1.title, v3.title]);
  })

  it("tracks current media through change", () => {
    let smgr = new StateManager.Builder().
      withVideo(v1).withVideo(v2).withImage(i3).
      build();

    expect(smgr.current()).toEqual(v1);
    expect(smgr.changeByTitle(i3.title)).toBe(true);
    expect(smgr.current()).toEqual(i3);
  })

  it("does not change current media if attempt to change fails", () => {
    let smgr = new StateManager.Builder().
      withImage(i1).withVideo(v2).withVideo(v3).
      build();

    expect(smgr.current()).toEqual(i1);
    expect(smgr.changeByTitle("no-title")).toBe(false);
    expect(smgr.current()).toEqual(i1);
  })
})
