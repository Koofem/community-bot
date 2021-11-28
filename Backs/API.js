const https = require('https');

const API = new (class API {

	_getRequest({ callback, options}) {
		const req = https.request(options, res => {
			console.log(`statusCode: ${res.statusCode}`)

			res.on('data', d => {
				callback(d)
			})
		})

		req.on('error', error => {
			return callback('error')
		})
		req.end()
	}

	async getRequest(path) {
		return new Promise((resolve) => {
			const options = {
				hostname: 'api.telegram.org',
				path: path,
				method: 'GET',
			}
			this._getRequest({options: options, callback: ((res)=>{
					if (res === 'error') {
						throw new Error('request failed')
					}
					return resolve(JSON.parse(res))
				})})
		})
	}

	_postRequest({url, callback, data, options}) {
		const req = https.request(options, res => {
			console.log(`statusCode: ${res.statusCode}`)

			res.on('data', d => {
				callback(d)
			})
		})

		req.on('error', error => {
			console.error(error)
		})

		req.write(data)
		req.end()

	}

	async postRequest(url, data, path) {
		return new Promise((resolve) => {
			const options = {
				hostname: url,
				path: path,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': data.length
				}
			}
			this._postRequest({url: url, data: data, options: options, callback: ((res)=>{
					return resolve(JSON.parse(res))
				})})
		})
	}

})();

module.exports = API;


