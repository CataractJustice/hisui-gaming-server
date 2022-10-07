class MData {
	#data;
	#flush;

	constructor() {
		this.#data = [];
		this.#flush = [];
	}

	set(client, slot, data) {
		this.#data[slot] = {blob: data, slot: slot, owner: client, scope: MData.scope.map};
		this.#flush[slot] = this.#data[slot];
	}

	static get scope() {
		return {
			responce: 0,
			personal: 1,
			map: 2,
			game: 3,
			server: 4 
		}
	};

	static make(client, slot, data, scope) 
	{
		return {blob: data, slot: slot, owner: client, scope: scope};
	}

	//gets array with slots changed since last flush
	getFlush() {
		let flush = [...this.#flush];
		this.#flush.length = 0;
		return flush;
	};

	getFull() {return this.#data;};
};

module.exports = MData;