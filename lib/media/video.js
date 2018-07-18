class Video {
  constructor(builder) {
    if (String(builder.constructor) !== String(Video.Builder)) {
      throw new TypeError("builder must be of type Video.Builder");
    }

    this.title = builder.title;
    this.urls = builder.urls;
    this.positionMs = builder.positionMs;
    this.autoPlay = builder.autoPlay;
  }

  toJSON() {
    return {
      type: "video",
      title: this.title,
      urls: this.urls,
      positionMs: this.positionMs,
      autoPlay: this.autoPlay
    }
  }

  static get Builder() {
    class Builder {
      constructor(title) {
        this.withTitle(title);
        this.urls = [];
        this.positionMs = 0;
        this.autoPlay = true;
      }

      withTitle(title) {
        if (typeof title != "string") {
          throw new TypeError("title must be String");
        }
        this.title = title;
        return this;
      }

      withURL(url) {
        if (typeof url != "string") {
          throw new TypeError(`url ${url} must be String`);
        } else if (url.length == 0) {
          throw new Error("url length cannot be zero")
        }
        this.urls.push(url);
        return this;
      }

      withPositionMs(positionMs) {
        if (positionMs < 0) {
          throw new Error("inital position cannot be negative")
        }
        this.positionMs = positionMs;
        return this;
      }

      withAutoPlay(autoPlay) {
        this.autoPlay = autoPlay;
        return this;
      }

      build() {
        if (this.title.length == 0) {
          throw new Error("title length cannot be zero")
        } else if (this.urls.length == 0) {
          throw new Error("provide at least one URL")
        }
        return new Video(this);
      }
    }

    return Builder;
  }
}

module.exports = Video;
