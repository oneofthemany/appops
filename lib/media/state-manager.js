const EventEmitter = require('events');
const Video = require("./video.js");
const Image = require("./image.js");

class StateManager extends EventEmitter {
  constructor(builder) {
    super();
    if (String(builder.constructor) !== String(StateManager.Builder)) {
      throw new TypeError("builder must be of type StateManager.Builder");
    }
    this.titleIdx = builder.titleIdx;
    this.media = builder.media;
    this.currentMedia = this.media[0];
  }

  current() {
    return this.currentMedia;
  }

  titles() {
    return this.media.map(m => m.title);
  }

  changeByTitle(title) {
    let media = this.titleIdx[title];
    if (media) {
      this.currentMedia = media;
      this.emit("change", media);
    }
    return media != null;
  }

  static get Builder() {
    class Builder {
      constructor() {
        this.titleIdx = {};
        this.media = [];
      }

      withVideo(video) {
        if (!(video instanceof Video)) {
          throw new TypeError(`${video} must be of type Video`);
        }
        this.media.push(video);
        this.titleIdx[video.title] = video;
        return this;
      }

      withImage(img) {
        if (!(img instanceof Image)) {
          throw new TypeError(`${img} must be of type Image`);
        }
        this.media.push(img);
        this.titleIdx[img.title] = img;
        return this;
      }

      build() {
        if (this.media.length == 0) {
          throw new Error("provide at least one Media instance")
        }
        return new StateManager(this);
      }
    }

    return Builder;
  }
}

module.exports = StateManager;
