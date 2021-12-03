const { mongodb } = require('Models/MongoBD');
class SpeechBD {
	speechBD
	constructor() {
	}

	async init() {
		this.speechBD = mongodb.db.collection('speech');
	}

	async getAllSpeech() {
		return await this.speechBD.find().toArray();
	}

	async writeNewSpeech(speech) {
		return await this.speechBD.insertOne(speech)
	}

	async udpateSpeechNotionID(index, id) {
		return await this.speechBD.findOneAndUpdate({index: index}, {
			$set: {
				notionPageID: id
			},
		}, {upsert: true});
	}
}


const speechBD = new SpeechBD();
module.exports = speechBD;
