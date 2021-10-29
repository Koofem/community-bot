const _isEqual = require('lodash/isEqual');
const _has = require('lodash/has');
const _get = require('lodash/get');

class Lodash {
	constructor() {
		this.isEqual = _isEqual;
		this.has= _has;
		this.get = _get
	}
	isEqual = null;
	has = null;
	get = null;
}

const lodash = new Lodash();
module.exports = lodash;
