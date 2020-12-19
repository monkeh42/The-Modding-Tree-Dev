//these functions all came directly from The Prestige Tree Rewritten by jacorb

const SOFTCAPS = {
    zEff: {
        start: new Decimal(1e150),
        type: "root",
        mag: new Decimal(3)
    },
    aEff: {
        start: new Decimal(1e20),
        type: "root",
        mag: new Decimal(2),
	},
	mGain: {
		start: new Decimal("1e500"),
		type: "log",
		exp: new Decimal(2),
	},
	sGain: {
		start: new Decimal(1000),
        type: "expRoot",
        mag: new Decimal(5)
	},
	zGain: {
		start: new Decimal(1e200),
        type: "root",
        mag: new Decimal(4)
	}
}

function softcapActive(name, val) {
	if (!SOFTCAPS[name]) return false;
	else return Decimal.gte(val, getSoftcapData(name, "start"));
}

function getSoftcapData(name, id) {
	let data = SOFTCAPS[name][id]
	if (isFunction(data)) return data();
	else return data;
}

function softcap(name, val) {
	val = new Decimal(val);

	if (!softcapActive(name, val)) return val;
	let type = getSoftcapData(name, "type");
	let start = getSoftcapData(name, "start");
	if (type=="root") {
		let mag = getSoftcapData(name, "mag");
		return val.times(start.pow(mag.sub(1))).root(mag);
	} else if (type=="expRoot") {
		let mag = getSoftcapData(name, "mag");
		return Decimal.pow(10, val.log10().root(mag).times(start.log10().pow(Decimal.sub(1, mag.pow(-1)))));
	} else if (type=="log") {
		let exp = getSoftcapData(name, "exp");
		return val.log10().pow(exp).times(start.div(start.log10().pow(exp)));
	} else return val;
}