require('dotenv')
const { MongoClient } = require('mongodb');

class Mongodb {
	constructor() {
	}
	uri = `mongodb+srv://mmelnik:${process.env.MONGO_DB_PASS}@cluster0.ctkme.mongodb.net/${process.env.MONGO_DB_BASE}?retryWrites=true&w=majority`;
	client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	db = '';

	async init() {
		try {
			await this.client.connect();
			this.db = await this.client.db(process.env.MONGO_DB_BASE);
			console.log('Все заебись, база подключена')
		} catch (e) {
			console.log(e)
		}
	}
}

const mongodb = new Mongodb();
module.exports = { mongodb }


