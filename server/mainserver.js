const WebSocket = require('ws');
const fs = require('fs');
const MClient = require("../client/mclient");
const LogHelper = require("../loghelper");
const MData = require('../multplayerdata/mdata');
const GameServer = require('./gameserver');
const conf = require('../conf/conf');
const https = require('https');

class MainServer {
	gameservers;
	#clients;
	#host;
	mdata;
	constructor (hostArgs) {
		if(hostArgs.https) 
		{
			const cert = fs.readFileSync(hostArgs.https.certpath);
			const key = fs.readFileSync(hostArgs.https.keypath);
			const httpsServer = https.createServer({cert, key}).listen(hostArgs.port);
			this.#host = new WebSocket.Server({server: httpsServer});
		} 
		else 
		{
			this.#host = new WebSocket.Server({port: hostArgs.port});
		}
		this.#host.on('connection', (client, request)=>this.onConnect(client, request));
		this.#clients = {};
		this.gameservers = {};
		this.mdata = new MData();
	}

	getGameServer(name) {
		if(!this.gameservers[name])
			this.gameservers[name] = new GameServer(name, this);

		return this.gameservers[name];
	}

	onConnect(client, request) {
		let mclient = new MClient(client, request, this);
		this.#clients[client.connectionId] = mclient;
		if(conf.echo) mclient.echoId();
		mclient.sendMDataPackets(this.mdata.getFull());
		client.onmessage = (req)=>this.onMessage(mclient, req);
		client.on('close', ()=>this.onClose(mclient));
		LogHelper.log(`New connection request`);
	}

	onMessage(client, req) {
		let data = req.data;
		if(typeof data === "string") return;
		console.log(`Incoming: client: ${client}, data: ${data.toString("hex")}`);
		let type = data.readUint8(0);
		switch(type) {
			case 0:
			    this.onMapPacket(client, data)
			break;

			case 1:
			    if(client.map)
			        client.map.processPacket(client, data.slice(1));
			break;
			default:
			    
			break;
		}
	}

	onMapPacket(client, data) {
		if(data.length == 3) {
			let mapId = data.readUInt16LE(1);
			if(!client.map || (client.map.id != mapId)) 
			    client.map = client.game.getMap(mapId);
			else
			    LogHelper.warn("Client tries to join the same map that it is already in");
		}
		else
			LogHelper.warn("Invalid map change packet");
	}

	onClose(client) {
		client.game.disconnectClient(client);
		if(!client.game.clientsCount) delete this.gameservers[client.game.name];
		LogHelper.log(`Client ${client.connectionId} closed connection.`);
	}

	broadcastMData(mdataSlots) {
		for(let c in this.#clients) {
			this.#clients[c].sendMDataPackets(mdataSlots);
		}
	}
}

module.exports = MainServer;