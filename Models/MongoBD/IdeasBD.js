const { mongodb } = require('Models/MongoBD');
class IdeasBD {
	ideasBD
	constructor() {
	}

	async init() {
		this.ideasBD = mongodb.db.collection('ideas');
	}

	async getAllIdeas() {
		return await this.ideasBD.find().toArray();
	}

	async writeNewIdea(idea) {
		return this.ideasBD.insertOne(idea)
	}

	async udpateIdeaNotionID(index, id) {
		return await this.ideasBD.findOneAndUpdate({index: index}, {
			$set: {
				notionPageID: id
			},
		}, {upsert: true});
	}
}


const ideasBD = new IdeasBD();
module.exports = ideasBD;
