const { Video, Image, StateManager } = require("../../lib/media");

function Parse(conf) {
  if (arguments.length != 1 || !conf) {
    throw new TypeError("invalid arguments");
  } else if (!Array.isArray(conf)) {
    conf = [conf];
  }

  let mgrBuilder = new StateManager.Builder();
  conf.forEach(media => {
    if (media.type == "video") {
      let mBuilder = new Video.Builder(media.title);

      media.urls && media.urls.forEach(url => mBuilder.withURL(url));
      media.position && mBuilder.withPositionMs(media.position);
      media.autoPlay !== undefined && mBuilder.withAutoPlay(media.autoPlay);

      mgrBuilder.withVideo(mBuilder.build());
    } else if (media.type == "image") {
      let mBuilder = new Image.Builder(media.title);
      media.urls && media.urls.forEach(url => mBuilder.withURL(url));
      mgrBuilder.withImage(mBuilder.build());
    } else {
      throw new TypeError(`invalid Media type: ${media.type}`)
    }
  });
  return mgrBuilder.build();
}

module.exports = Parse;
