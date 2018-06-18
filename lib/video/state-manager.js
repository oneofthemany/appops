const EventEmitter = require('events');
const Video = require("./video.js");

class StateManager extends EventEmitter {
  constructor(builder) {
    super();
    if (String(builder.constructor) !== String(StateManager.Builder)) {
      throw new TypeError("builder must be of type StateManager.Builder");
    }
    this.videosByTitle = builder.videosByTitle;
    this.videos = builder.videos;
    this.currentVideo = this.videos[0];
  }

  video() {
    return this.currentVideo;
  }

  titles() {
    return this.videos.map(video => video.title);
  }

  changeByTitle(title) {
    let newVideo = this.videosByTitle[title];
    if (newVideo) {
      this.currentVideo = newVideo;
      this.emit("change", newVideo);
    }
    return newVideo != null;
  }

  static get Builder() {
    class Builder {
      constructor() {
        this.videosByTitle = {};
        this.videos = [];
      }

      withVideo(video) {
        if (!(video instanceof Video)) {
          throw new TypeError(`${video} must be of type Video`);
        }
        this.videos.push(video);
        this.videosByTitle[video.title] = video;
        return this;
      }

      build() {
        if (this.videos.length == 0) {
          throw new Error("provide at least one Video")
        }
        return new StateManager(this);
      }
    }

    return Builder;
  }
}

module.exports = StateManager;
