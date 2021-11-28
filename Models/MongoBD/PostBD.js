const { mongodb } = require('Models/MongoBD');
class PostBD {
	postBD
	constructor() {
	}

	async init() {
		this.postBD = mongodb.db.collection('posts')
	}

	async getAllPosts() {
		return await this.postBD.find().toArray();
	}

	async writeNewPost(post) {
		return await this.postBD.insertOne(post)
	}

	async udpatePostNotionID(index, id) {
		return await this.postBD.findOneAndUpdate({index: index}, {
			$set: {
				notionPageID: id
			},
		}, {upsert: true});
	}
}

const postBD = new PostBD();
module.exports = postBD;
