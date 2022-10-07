const MData = require('../multplayerdata/mdata');
const BufferBuilder = require('../bufferbuilder');
let lastConnectionId = 0;

const PacketType = {
	connect: 0,
	inmap: 1,
	disconnect: 2,
	mdata: 3
}

class MClient {
	#wsConnection;
	#connectionId;
	#uid;
	#game;
	#map;
	#server;
	mdata;

	constructor(wsConnection, request, server) {
		this.#wsConnection = wsConnection;
		this.#server = server;
		this.#connectionId = lastConnectionId++;
		/*TO-DO: figure user id from request*/
		this.#uid = 1;
		/*TO-DO: get game name from the request*/
		let gameServerName = "Yume Nikki";
		this.#game = server.getGameServer(gameServerName);
		this.#game.connectClient(this);
		this.mdata = new MData();
	}

	get map() { return this.#map; }
	set map(map) { 
		if(this.#map) {
			this.#map.disconnectClient(this);
		}
		this.#map = map; 
		map.connectClient(this);
	}

	get game() { return this.#game; }

	get server() { return this.#server; }

	get connectionId() { return this.#connectionId; }

	get uid() { return this.#uid; }

	get ws() { return this.#wsConnection; }

	sendConnectPacket(client) {
		let buffer = new BufferBuilder();
		buffer.addUint8Array([PacketType.connect]);
		buffer.addUint32Array([client.connectionId]);
		this.ws.send(buffer.get());
	}

	sendInMapPacket(client) {
		let buffer = new BufferBuilder();
		buffer.addUint8Array([PacketType.inmap]);
		buffer.addUint32Array([client.connectionId]);
		this.ws.send(buffer.get());
	}

	sendMDataPacket(mdataSlot) {
		if(mdataSlot.owner.connectionId == this.#connectionId) return;
		let buffer = new BufferBuilder();
		buffer.addUint8Array([PacketType.mdata, mdataSlot.scope]);
		buffer.addUint32Array([mdataSlot.owner.connectionId]);
		buffer.addUint16Array([mdataSlot.slot]);
		buffer.addBuffer(mdataSlot.blob);
		this.ws.send(buffer.get());
	}
	
	sendMDataPackets(mdataSlots) {
		if(Array.isArray(mdataSlots)) {
			for(let m of mdataSlots) {
				if(m)
					this.sendMDataPacket(m);
			}
		} else {
			this.sendMDataPacket(mdataSlots);
		}
	}

	sendDisconnectPacket(client) {
		let buffer = new BufferBuilder();
		buffer.addUint8Array([PacketType.disconnect]);
		buffer.addUint32Array([client.connectionId]);
		this.ws.send(buffer.get());
	}
}

module.exports = MClient;