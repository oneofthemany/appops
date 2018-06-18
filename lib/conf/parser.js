const { Video, StateManager } = require("../../lib/video");

function Parse(conf) {
  if (arguments.length != 1 || !conf) {
    throw new TypeError("invalid arguments");
  } else if (!Array.isArray(conf)) {
    conf = [conf];
  }

  let vmBuilder = new StateManager.Builder();
  conf.forEach(vconf => {
    let vBuilder = new Video.Builder(vconf.title);

    vconf.urls && vconf.urls.forEach(url => vBuilder.withURL(url));
    vconf.position && vBuilder.withPositionMs(vconf.position);
    vconf.autoPlay !== undefined && vBuilder.withAutoPlay(vconf.autoPlay);

    vmBuilder.withVideo(vBuilder.build());
  });
  return vmBuilder.build();
}

module.exports = Parse;
