require('dotenv')
const { MongoClient } = require('mongodb');
// const uri = `mongodb+srv://mmelnik:${process.env.MONGO_DB_PASS}@cluster0.ctkme.mongodb.net/${process.env.MONGO_DB_BASE}?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class Mongodb {
	constructor() {}
	uri = `mongodb+srv://mmelnik:${process.env.MONGO_DB_PASS}@cluster0.ctkme.mongodb.net/${process.env.MONGO_DB_BASE}?retryWrites=true&w=majority`;
	client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	db = '';

	async init() {
		try {
			await this.client.connect();
			this.db = await this.client.db().collection('users')
			console.log('База подключена');
			// console.log(this.db)
			const test = await this.db.findOne({name:"Михаил"})
			console.log(test);
		}catch (e) {
			console.log(e)
		}
	}
}

module.exports = new Mongodb()


