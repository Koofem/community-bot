const _isEqual = require('lodash/isEqual');
const _has = require('lodash/has')

class Lodash {
	constructor() {
		this.isEqual = _isEqual;
		this.has= _has;
	}
	isEqual = null;
	has = null
}

const lodash = new Lodash();
module.exports = lodash;
