
let ConsoleCommandsDictionary = {
	
};

class ConsoleCommands {
	constructor() {
		process.stdin.on('data', data => 
		{
		    /*
		    let args = data.split(' ');
		    if(ConsoleCommandsDictionary[args[0]])
		    ConsoleCommandsDictionary[args[0]](args);
		    */
		});
	}
}

module.exports = ConsoleCommands;