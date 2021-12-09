const { mongodb } = require('Models/MongoBD');
class QuestionsBD {
	questionsBD
	constructor() {
	}

	async init() {
		this.questionsBD = mongodb.db.collection('questions');
	}

	async getAllQuestions() {
		return await this.questionsBD.find().toArray();
	}

	async findQuestion(index) {
		return await this.questionsBD.findOne({index: Number(index)});
	}

	async updateQuestionAnswer(index, answer) {
		return await this.questionsBD.updateOne({index: index}, {
			$set: {
				answered: true,
				answer: answer
			}
		})
	}

	async writeNewQuestion(question) {
		return await this.questionsBD.insertOne(question)
	}

	async udpateQuestionNotionID(index, id) {
		return await this.questionsBD.findOneAndUpdate({index: index}, {
			$set: {
				notionPageID: id
			},
		}, {upsert: true});
	}
}


const questionsBD = new QuestionsBD();
module.exports = questionsBD;
