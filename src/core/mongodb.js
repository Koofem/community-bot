require('dotenv')
const { MongoClient } = require('mongodb');
// const uri = `mongodb+srv://mmelnik:${process.env.MONGO_DB_PASS}@cluster0.ctkme.mongodb.net/${process.env.MONGO_DB_BASE}?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

class Mongodb {
	constructor() {}
	uri = `mongodb+srv://mmelnik:${process.env.MONGO_DB_PASS}@cluster0.ctkme.mongodb.net/${process.env.MONGO_DB_BASE}?retryWrites=true&w=majority`;
	client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	db = '';
	userBD = null;
	postDB = null;
	speechDB = null;
	questionsBD = null;
	ideasBD =null;

	async init() {
		try {
			await this.client.connect();
			this.db = await this.client.db('X5Community');
			await this._initCollection();
			console.log('Все заебись, база подключена')
		}catch (e) {
			console.log(e)
		}
	}

	async _initCollection() {
		this.userBD = this.db.collection('users');
		this.postDB = this.db.collection('posts');
		this.speechDB = this.db.collection('speech');
		this.questionsBD = this.db.collection('questions');
		this.ideasBD = this.db.collection('ideas');
	}

	async getAllUsers() {
		return await this.userBD.find().toArray();
	}

	async getAllQuestions() {
		return await this.questionsBD.find().toArray();
	}

	async getAllPost() {
		return await this.postDB.find().toArray();
	}

	async findPost(index) {
		return await this.postDB.findOne({index: Number(index)});
	}

	async updatePostNotionPageID(index, pageID) {
		return await this.postDB.updateOne({index: index}, {
			$set: {
				notionPageID: pageID
			}
		})
	}

	async findQuestion(index) {
		return await this.questionsBD.findOne({index: Number(index)});
	}

	async updateQuestionNotionPageID(index, pageID) {
		return await this.questionsBD.updateOne({index: index}, {
			$set: {
				notionPageID: pageID
			}
		})
	}

	async updateQuestionAnswer(index, answer) {
		return await this.questionsBD.updateOne({index: index}, {
			$set: {
				answered: true,
				answer: answer
			}
		})
	}

	async findUser(id) {
		return await this.userBD.findOne({id: id});
	}
}

const mongodb = new Mongodb();
module.exports = mongodb;


