const dnsd = require('dnsd');

exports.NewServer = (port, staticIp, fn) => {
  var server = dnsd.createServer(function(req, res) {
    res.end(staticIp)
    fn && fn(req);
  });

  return {
    start: () => { server.listen(port, '0.0.0.0') },
    close: () => { server.close() }
  }
}
