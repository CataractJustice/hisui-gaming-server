const MData = require("../multplayerdata/mdata");
const MapServer = require("./mapserver");

class GameServer {
	mainserver;
	mapservers;
	clients;
	clientsCount;
	name;
	mdata;
	constructor(name, server) {
		this.clients = {};
		this.clientsCount = 0;
		this.name = name;
		this.mainserver = server;
		this.mdata = new MData();
		this.mapservers = [];
	}

	connectClient(client) {
		this.clients[client.connectionId] = client;
		this.clientsCount++;
		client.sendMDataPackets(this.mdata.getFull());
	}

	disconnectClient(client) {
		delete this.clients[client.connectionId];
		if(client.map) {
			client.map.disconnectClient(client);
			if(client.map.clientsCount == 0) {
			    delete this.mapservers[client.map.id];
			}
		}
		this.clientsCount--;
	}

	broadcastMData(mdataSlots) {
		for(let c in this.clients) {
			this.clients[c].sendMDataPackets(mdataSlots);
		}
	}

	getMap(id) {
		if(!this.mapservers[id])
			this.mapservers[id] = new MapServer(id, this); 
		return this.mapservers[id];
	}
}

module.exports = GameServer;