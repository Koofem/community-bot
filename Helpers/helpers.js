const userBD = require("Models/MongoBD/UserBD");
const questionsBD = require("Models/MongoBD/QuestionsBD");
const ideasBD = require("Models/MongoBD/IdeasBD");
const lodash = require("../lodash");
const API = require("Backs/API")
const notion = require("Models/notion")
const speechBD = require("Models/MongoBD/SpeechBD");
const postBD = require("Models/MongoBD/PostBD");

module.exports = {
	async findUserName(user) {
			return await userBD.findUserName(user)
	},

	async resetLastAction(user) {
		return await userBD.resetUserAction(user)
	},

	async saveOrUpdateUser(user) {
		return await userBD.saveOrUpdateUser(user)
	},

	 checkIsAdmin(user) {
		return lodash.has(user, 'admin')
	},

	async findAllUsers () {
		return await userBD.getAllUsers()
	},

	async setActionToUser(user, action) {
		return await userBD.setActionToUser(user, action)
	},

	async setActionWithPropertyToUser(user, action, property) {
		return await userBD.setActionWithPropertyToUser(user, action, property)
	},

	async getAllUsers() {
		return await userBD.getAllUsers()
	},

	async resetUserAction(user) {
		return await userBD.resetUserAction(user)
	},

	async findUser(user) {
		return await userBD.findUser(user)
	},

	async findUserById(id) {
		return await userBD.findUserById(id)
	},

	checkCurrentAction(user) {
		return lodash.has(user, 'current_action')
	},

	async getPhotoID(ctx) {
		let photoID = null;
		let photo = null
		const url = `/bot${process.env.BOT_TOKEN}/getFile?file_id=${ctx.message.photo[ctx.message.photo.length - 1].file_id}`;
		return new Promise(async (resolve, reject) => {
			try {
				photo = await API.getRequest(url)
				photoID = photo.result.file_id;
			} catch (e) {
				return reject(e)
			}
			return resolve(photoID)
		})
	},

	async getAllQuestions() {
		return questionsBD.getAllQuestions();
	},

	async updateQuestionAnswer(index, answer) {
		return questionsBD.updateQuestionAnswer(index, answer)
	},

	async findQuestion(index) {
		return questionsBD.findQuestion(index);
	},

	async writeNewQuestion(question) {
		return questionsBD.writeNewQuestion(question)
	},

	async getAllIdeas() {
		return ideasBD.getAllIdeas()
	},

	async writeNewIdea(idea) {
		return ideasBD.writeNewIdea(idea)
	},

	async getAllSpeech() {
		return speechBD.getAllSpeech()
	},

	async writeNewSpeech(speech) {
		return speechBD.writeNewSpeech(speech)
	},

	async getAllPosts() {
		return postBD.getAllPosts()
	},

	async writeNewPost(post) {
		return postBD.writeNewPost(post)
	},

	//Notion
	async makeNotionQuestionPage(index, question, user) {
		const userFromBd = await userBD.findUser(user)
		const pageID = await notion.createQuestionNotion(question, index, userFromBd)
		return await questionsBD.udpateQuestionNotionID(index, pageID)
	},

	async makeNotionIdeaPage(index, idea, user) {
		const userFromBd = await userBD.findUser(user)
		const pageID = await notion.createIdeasNotion(idea, userFromBd, index)
		return await ideasBD.udpateIdeaNotionID(index, pageID);
	},

	async makeNotionSpeechPage(index, speech, user) {
		const userFromBd = await userBD.findUser(user)
		const pageID = await notion.createSpeechNotion(speech, userFromBd, index)
		return await speechBD.udpateSpeechNotionID(index,pageID);
	},

	async makeNotionPostPage(index, post, user, type) {
		const userFromBd = await userBD.findUser(user)
		const pageID = await notion.createPostNotion(post, userFromBd, index, type)
		return await postBD.udpatePostNotionID(index,pageID);
	},

	async updateQuestionNotion(notionPageID, answer) {
		return notion.updateQuestionNotion(notionPageID, answer)
	}
}
