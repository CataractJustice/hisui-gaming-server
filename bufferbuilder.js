class BufferBuilder {
	#bufferList;
	constructor() {
		this.#bufferList = [];
	}

	addString(str) {
		this.#bufferList.push(Buffer.concat([Buffer.from(str, 'base64'), Uint8Array.of(0)]));
	}

	addUintArray(uintArray) {
		this.#bufferList.push(new Uint8Array(uintArray.buffer, uintArray.byteOffset, uintArray.byteLength));
	}

	addUint8Array(uint8list) {
		this.addUintArray(new Uint8Array(uint8list));
	}

	addUint16Array(uint16list) {
		this.addUintArray(new Uint16Array(uint16list));
	}

	addUint32Array(uint32list) {
		this.addUintArray(new Uint32Array(uint32list));
	}

	addBuffer(buffer) {
		this.#bufferList.push(buffer);
	}

	get() {
		return Buffer.concat(this.#bufferList);
	}
}

module.exports = BufferBuilder;