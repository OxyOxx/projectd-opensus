class Bits {
	constructor(bitfield, flags){
		this.bitfield = bitfield||0;
		this.flags = flags||{};
	}
	add(...bits){
		for(const b of bits){
			if(this.flags[b]) this.bitfield |= this.flags[b];
		}
		return this;
	}
	delete(...bits){
		let total = 0;
		for (const bit of bits) {
      		if(this.flags[bit]) total |= this.flags[bit];
    	}
    	this.bitfield &= ~total;
    	return this;
	}
	has(...bits){
		return bits.every(x => (this.bitfield & this.flags[x]) === this.flags[x]);
	}
	get toArray(){
		return Object.keys(this.flags).filter(bit => this.has(bit));
	}
}
module.exports = Bits;