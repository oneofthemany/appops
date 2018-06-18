const cli = require("inquirer");
const { Parse } = require("../conf");
const { Server } = require("../video");

const argv = require("yargs")
  .usage("Usage: $0 --port [num] --conf [file]")
  .describe("port", "Set the WebSocket listener port")
  .describe("conf", "Path to JSON file with video configurations")
  .demandOption(["port", "conf"])
  .alias("help", "h")
  .argv;

const stateManager = Parse(require(argv.conf));
const server = new Server(argv.port);

// handling events

server.on("init", (client) => {
  server.send(client, "init", stateManager.video());
});

stateManager.on("change", (video) => {
  server.broadcast("change", video);
});

// main - an interactive cli

const videoChoices = [{
  type: "list",
  name: "video",
  message: "Choose a video to play",
  choices: stateManager.titles()
}];

function handleChoice(answers) {
  stateManager.changeByTitle(answers.video);
  prompt();
}

function prompt() {
  cli.prompt(videoChoices).then(handleChoice);
}

prompt();
