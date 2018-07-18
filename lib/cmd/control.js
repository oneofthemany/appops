const cli = require("inquirer");
const { Parse } = require("../conf");
const { Server } = require("../media");

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
  server.send(client, "init", stateManager.current().toJSON());
});

stateManager.on("change", (media) => {
  server.broadcast("change", media.toJSON());
});

// main - an interactive cli

const choices = [{
  type: "list",
  name: "media",
  message: "Choose media",
  choices: stateManager.titles()
}];

function handleChoice(answers) {
  stateManager.changeByTitle(answers.media);
  prompt();
}

function prompt() {
  cli.prompt(choices).then(handleChoice);
}

prompt();
