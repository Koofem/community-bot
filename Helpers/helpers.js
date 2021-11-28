const userBD = require("Models/MongoBD/UserBD");
const lodash = require("../lodash");
const API = require("Backs/API")

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

	async getAllUsers() {
		return await userBD.getAllUsers()
	},

	async resetUserAction(user) {
		return await userBD.resetUserAction(user)
	},

	async findUser(user) {
		return await userBD.findUser(user)
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



	}

}
