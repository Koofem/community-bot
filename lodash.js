const _has = require('lodash/has');
const _get = require('lodash/get');

class Lodash {
	constructor() {
		this.has = _has;
		this.get = _get
	}
	has = null;
	get = null;
}

const lodash = new Lodash();
module.exports = lodash;
