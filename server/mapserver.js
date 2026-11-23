const MData = require("../multplayerdata/mdata");

class MapServer {
	clients;
	gameserver;
	mdata;
	clientCount;
	id;
	constructor(id, gameserver) {
		this.clients = {};
		this.gameserver = gameserver;
		this.mdata = new MData();
		this.clientCount = 0;
		this.id = id;
	}

	processPacket(client, data) {

		let packet = this.parsePacket(data);

		if(packet.flags.broadcastForMap)
			this.broadcastMData(MData.make(client, packet.slot, packet.data, MData.scope.map));

		if(packet.flags.broadcastForGame)
			this.gameserver.broadcastMData(MData.make(client, packet.slot, packet.data, MData.scope.game));

		if(packet.flags.broadcastForServer)
			this.gameserver.mainserver.broadcastMData(MData.make(client, packet.slot, packet.data, MData.scope.server));

		if(packet.flags.saveForPlayer) {
			client.mdata.set(client, packet.slot, packet.data);
		}
		if(packet.flags.saveForMap) {
			this.mdata.set(client, packet.slot, packet.data);
		}
		if(packet.flags.saveForGame) {
			this.gameserver.mdata.set(client, packet.slot, packet.data);
		}
		if(packet.flags.saveForServer) {
			this.gameserver.mainserver.mdata.set(client, packet.slot, packet.data);
		} 
	}

	broadcastMData(mdataSlots) {
		for(let c in this.clients) {
			this.clients[c].sendMDataPackets(mdataSlots);
		}
	}

	parsePacket(data) {
		/*
		::packet format::
		[0]handle flags:
		0 - broadcast for map
		1 - broadcast for game
		2 - broadcast for server
		3 - save for player
		4 - save for map
		5 - save for game
		6 - save for server
		[1]slot
		[2...]slot data
		*/
		const flagsMap = {
			broadcastForMap: 0,//1
			broadcastForGame: 1,//2
			broadcastForServer: 2,//4
			saveForPlayer: 3,//8
			saveForMap: 4,//16
			saveForGame: 5,//32
			saveForServer: 6//64
		}
		
		let flagsByte = data.readUint8(0);
		let flags = {};

		for(let flag in flagsMap) {
			flags[flag] = flagsByte & (1 << flagsMap[flag]);
		}

		return {flags: flags, slot: data.readUint16LE(1), data: data.slice(3)}
	}

	connectClient(client) {
		for(let c in this.clients) {
			client.sendInMapPacket(this.clients[c]);
		}
		this.clients[client.connectionId] = client;
		for(let c in this.clients) {
			if(this.clients[c] != client) {
			    this.clients[c].sendConnectPacket(client);
			    this.clients[c].sendMDataPackets(client.mdata.getFull());
			    client.sendMDataPackets(this.clients[c].mdata.getFull());
			    client.sendMDataPackets(this.mdata.getFull());
			}
		}
		this.clientCount++;
	}

	disconnectClient(client) {
		delete this.clients[client.connectionId];
		for(let c in this.clients) {
			this.clients[c].sendDisconnectPacket(client);
		}
		this.clientCount--;
	}
}

module.exports = MapServer;