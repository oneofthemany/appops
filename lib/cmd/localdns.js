var localdns = require("../localdns"),
    process = require("process");

const argv = require("yargs")
  .usage("Usage: $0 --port [num] --ip [str]")
  .describe("port", "Port to runs DNS server on")
  .describe("ip", "Static IP all requests will return with")
  .demandOption(["port", "ip"])
  .alias("help", "h")
  .argv;

var server = localdns.NewServer(argv.port, argv.ip, (req) => {
  console.log("request: ", req.question)  ;
});

function onexit(code) {
  server.close();
  console.log("localdns exiting ...");
}

process.on('SIGINT', onexit);
process.on('SIGTERM', onexit);

server.start();
console.log("localdns server running at 0.0.0.0:%d", argv.port)

