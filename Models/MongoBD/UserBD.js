const { mongodb } = require('Models/MongoBD');
class UserBD {
	userBD
	constructor() {
	}

	async init() {
		this.userBD = mongodb.db.collection('users');
	}

	async getAllUsers() {
		return await this.userBD.find().toArray();
	}

	async findUser(user) {
		return await this.userBD.findOne({id: user.id});
	}

	async saveOrUpdateUser(user) {
		return await this.userBD.findOneAndUpdate({id: user.id}, {
			$set: {
				first_name: user.first_name,
				username: user.username,
				last_name: user.last_name? user.last_name : '',
				id: user.id,
			},
		}, {upsert: true});
	}

	async findUserName(user) {
		const userBD = await this.userBD.findOne({id: user.id});
		return userBD.first_name;
	}

	async setActionToUser(user, action) {
		return await this.userBD.findOneAndUpdate({id: user.id}, {
			$set: {
				current_action: action,
			},
		}, {upsert: true});
	}

	async resetUserAction(user) {
		return await this.userBD.updateOne({id: user.id}, {
			$unset: {
				current_action: 1
			}
		})
	}
}

const userBD = new UserBD();
module.exports = userBD;
