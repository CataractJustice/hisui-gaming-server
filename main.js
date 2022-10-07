const MainServer = require("./server/mainserver");
const ConsoleCommands = require('./consolecommands');
const conf = require("./conf/conf")

function main() {
	new MainServer(conf.server);
	new ConsoleCommands();
}

main();