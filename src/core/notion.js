const { Client } = require('@notionhq/client');

class Notion {
	constructor() {}
	client;

	async init() {
		return new Promise((resolve) => {
			this.client =  new Client({ auth: process.env.NOTION_TOKEN });
			return resolve();
		}).then(async()=> {
			console.log('Notion подключен');
		})

	}
}

const notionApi = new Notion();
module.exports = notionApi;

