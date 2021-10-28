const Mongodb = require('./mongodb');
const lodash = require('../../lodash');
const messages = require('../../message');
const action = require('../../actions');
const request = require('request')

class MessagesHandler {
	constructor() {
	}

	async initMongodb() {
		await Mongodb.init();
	}

	async saveOrUpdateUser(user) {
		const userBD = await this.findUser(user);
		if (userBD) {
			const isUsersEqual = this._compare(user, userBD);
			if (!isUsersEqual){
				return await Mongodb.userBD.updateOne({id: userBD.id}, {
					$set: {
						first_name: user.first_name,
						username: user.username,
						last_name: user.last_name? user.last_name : ''
					}
				})
			}
		} else {
			const insertUser = {
				id: user.id,
				first_name: user.first_name? user.first_name : '',
				username: user.username,
				last_name: user.last_name? user.last_name : ''
			}

			user.last_name ? insertUser.last_name = user.last_name : '';

			return await Mongodb.userBD.insertOne(insertUser)
		}

	}

	_compare(user, userBD) {
		return (user.first_name === userBD.first_name && user.last_name === userBD.last_name && user.username === userBD.username)
	}

	async findUserName(user) {
		const foundUser = await this.findUser(user)
		return foundUser.first_name;
	}

	async findUser(user) {
		return await Mongodb.userBD.findOne({id: user.id});
	}

	async restartAndStartCommandHandler(ctx) {
		await this.saveOrUpdateUser(ctx.from)
		const user = await this.findUser(ctx.from)
		await this.resetLastAction(user);
		await this.menuSelection(ctx,user);
	}

	async menuSelection(ctx, user) {
		if (lodash.has(user, 'admin')) {
			return this.showMenuSelection(ctx)
		} else {
			return this.showRegularMenu(ctx);
		}
	}

	async showMenuSelection(ctx) {
		const userName = await this.findUserName(ctx.from);
		const msg = `О великий и всемогущий(ая) ${userName}, как я могу услужить тебе?`
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			reply_markup: {
				keyboard: [
					[messages.ADMINMENU, messages.REGULARMENU],
				],
				resize_keyboard: true,
			},
		})
	}

	checkIsAdmin(user) {
		return lodash.has(user, 'admin')
	}

	async massiveMessageHandler(ctx) {
		const user = await this.findUser(ctx.from)
		if (this.checkIsAdmin(user)) {
			await Mongodb.userBD.updateOne({id: user.id}, {
				$set: {
					current_action: {
						action: 'massive_message',
					},
				}
			})
			await ctx.telegram.sendMessage(ctx.chat.id, 'Следующее сообщение будет отправлено всем, у кого запущен бот, осторожнее со словами!:)', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		} else {
			const msg = 'ты немного ошибся, скорее всего тебе нужно другое меню!:)'
			return this.showRegularMenu(ctx, msg);
		}
	}

	async answerMassiveMessageHandler(ctx, user) {
		const usersArr = await Mongodb.userBD.find().toArray();
		const massiveMessage = ctx.update.message.text;
		usersArr.forEach(async (user) => {
			return await ctx.telegram.sendMessage(user.id, massiveMessage);
		})

		await this.resetLastAction(user);
		const msg = 'Сообщения отправились, даже тебе, поздравляю!'
		return this.showAdminMenu(ctx, msg);
	}

	async showAdminMenu(ctx, extraMsg) {
		const msg = 'Доступные функции';
		const sendMessage = extraMsg ? extraMsg : msg
		const user = await this.findUser(ctx.from)
		if (this.checkIsAdmin(user)) {
			await ctx.telegram.sendMessage(ctx.chat.id, sendMessage, {
				reply_markup: {
					keyboard: [
						[messages.MASSIVEMESSAGE],
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		} else {
			const msg = 'ты немного ошибся, скорее всего тебе нужно другое меню!:)'
			return this.showRegularMenu(ctx, msg);
		}
	}

	async showRegularMenu(ctx, extraMsg) {
		const userName = await this.findUserName(ctx.from);
		const msg = "Чем я могу помочь?";
		const sendMessage = extraMsg ? `${userName}, ${extraMsg}` : `${userName}, ${msg}`
		await ctx.telegram.sendMessage(ctx.chat.id, sendMessage, {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})
	}

	async timeTableHandler(ctx) {
		const link = '<a href="https://juvenile-sailboat-95a.notion.site/f4f58fecffe4486c92649de506483d4b">ссылке</a>'
		await ctx.telegram.sendMessage(ctx.chat.id, 'Супер, за нашим расписанием можно следить по '+ link, {
			parse_mode:'HTML'
		})
	}

	async informationHandler(ctx) {
		const techNewsLink = '<a href="https://t.me/joinchat/TzL23fprszHePDo5">Канала в телеграм X5 Tech News</a>'
		const communityLink = '<a href="https://t.me/joinchat/S87gOoavoRmhet1O">Канала в телеграм X5 Tech Community</a>'
		const discordLink = '<a href="https://discord.gg/CpejhRKxc2">Discord-сервера</a>'
		const Olya = '<a href="https://t.me/opastuk">Оля Пастухова</a>'
		const Nikita = '<a href="https://t.me/NickPanormov">Никита Панормов</a>'
		const Tolya = '<a href="https://t.me/ababin71517">Толя Бабин</a>'
		const message = "Это просто здорово! Сейчас наше комьюнити состоит из: \n\n" + techNewsLink + ", куда мы публикуем самые интересные новости с просторов технического мира.\n\n" +
			communityLink + ", куда мы публикуем всякие интересные внутренности, а так же записи всех выступлений, проводимых комьюнити. Если ты решил сложную рабочую задачу, придумали что-то крутое и просто хочешь поделиться новинками в команде, то тебе сюда!\n\n" +
			discordLink + ", где мы иногда общаемся\n\n" + 'Модератором комьюнити является ' + Olya + ', по любым вопросам и предложениям можешь писать ей напрямую, она будет рада ответить. Большую поддержку комьюнити так же оказывают ' + Nikita + ', и '+ Tolya +', они ведут свои рубрики и делают очень много крутого для нас.' +
			'\n\nНо сердце комьюнити - это ты! Каждый из нас - одинаково важная часть команды. Давайте делиться знаниями, развиваться и учиться вместе! Здесь всех любят ❤️'

		await ctx.telegram.sendMessage(ctx.chat.id, message, {
			parse_mode:'HTML'
		})
	}

	async askQuestionHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const userName = await this.findUserName(ctx.from);
		const msg = userName ? `${userName}, слушаю тебя! \nНапиши вопрос одним предложением!`: 'Слушаю тебя!\n Напиши вопрос одним предложением!';
		await Mongodb.userBD.updateOne({id: user.id}, {
			$set: {
				current_action: {
					action: 'ask_question',
				},
			}
		})
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.BACK]
				],
				resize_keyboard: true,
			},

		})
	}

	async speechHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const userName = await this.findUserName(ctx.from);
		const msg = userName ? `${userName}, это просто потрясающе! В рамках комьюнити мы проводим как и небольшие воркшопы (15-40 минут), так более серьезные выступления для всего X5 FoodTech. Опиши свою идею одним сообщением, и мы с тобой свяжемся, чтобы выбрать удобный формат и дату!`:
			'Это просто потрясающе! В рамках комьюнити мы проводим как и небольшие воркшопы (15-40 минут), так более серьезные выступления для всего X5 FoodTech. Опиши свою идею одним сообщением, и мы с тобой свяжемся, чтобы выбрать удобный формат и дату!';
		await Mongodb.userBD.updateOne({id: user.id}, {
			$set: {
				current_action: {
					action: 'want_to_speak',
				},
			}
		})
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.BACK]
				],
				resize_keyboard: true,
			},

		})
	}

	async giveIdeaHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const userName = await this.findUserName(ctx.from);
		const msg = userName ? `${userName}, замечательно! Мы прислушиваемся ко всем комментариям аудитории. Опиши пожалуйста мне все одним сообщением 🙂`:
			'Замечательно! Мы прислушиваемся ко всем комментариям аудитории. Опиши пожалуйста мне все одним сообщением 🙂';
		await Mongodb.userBD.updateOne({id: user.id}, {
			$set: {
				current_action: {
					action: 'give_idea',
				},
			}
		})
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.BACK]
				],
				resize_keyboard: true,
			},

		})
	}

	async suggestExternalPostHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const msg = "Я тебя услышал. Пожалуйста, опиши свою новость в одном сообщении, прикрепи требуемые ссылки, изображения также прошу тебя прислать ссылкой на внешний ресурс, иначе я не смогу их принять ☹️"
		await Mongodb.userBD.updateOne({id: user.id}, {
			$set: {
				current_action: {
					action: 'suggest_external_post',
				},
			}
		})
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.BACK]
				],
				resize_keyboard: true,
			},
		})
	}

	async suggestPrivatePostHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const msg = "Я тебя услышал. Пожалуйста, опиши свою новость в одном сообщении, прикрепи требуемые ссылки, изображения также прошу тебя прислать ссылкой на внешний ресурс, иначе я не смогу их принять ☹️"
		await Mongodb.userBD.updateOne({id: user.id}, {
			$set: {
				current_action: {
					action: 'suggest_private_post',
				},
			}
		})
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.BACK]
				],
				resize_keyboard: true,
			},
		})
	}


	async suggestNewsHandler(ctx) {
		const userName = await this.findUserName(ctx.from);
		const msg = userName ? `${userName}, отлично! Куда бы ты хотел опубликовать новость?`:
			'отлично! Куда бы ты хотел опубликовать новость?';

		await ctx.telegram.sendMessage(ctx.chat.id, msg, {
			parse_mode: 'HTML',
			reply_markup: {
				keyboard: [
					[messages.EXTERNALCHANNEL, messages.PRIVATECHANNEL],
					[messages.BACK]
				],
				resize_keyboard: true,
			},
		})
	}

	async simpleMessageHandler(ctx) {
		const user = await this.findUser(ctx.from);
		const userName = await this.findUserName(ctx.from);

		if (lodash.has(user, 'current_action')) {
				switch (user.current_action.action) {
					case action.ASKQUESTION:
						return this.answerQuestionHandler(ctx, user);
						break;
					case action.GIVEIDEA:
						return this.answerIdeaHandler(ctx, user);
						break;
					case action.IWANTTOSPEAK:
						return this.answerSpeechHandler(ctx, user);
						break;
					case action.SUGGESTEXTERNALPOST:
						return this.answerSuggestExternalPostHandler(ctx, user);
						break;

					case action.SUGGESTPRIVATEPOST:
						return this.answerSuggestPrivatePostHandler(ctx, user);
						break;
					case action.MASSIVEMESSAGE:
						return this.answerMassiveMessageHandler(ctx, user);
				}
		} else {
			return await this.sendSimpleMessage(ctx, userName);
		}
	}

	async photoMessageHandler(ctx) {
		const photoPath = await this.getPhotoPath(ctx);
		console.log(photoPath)
	}

	async getPhotoPath(ctx) {
		let photoUrl = null;
		const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${ctx.message.photo[ctx.message.photo.length - 1].file_id}`;
		return new Promise((resolve) => {
			 request(url, (err, response, body)=> {
				if (err) return photoUrl(photoUrl);
				const bodyObject = JSON.parse(body);
				photoUrl = bodyObject.result.file_path;
				return resolve(photoUrl);
			})
		})
	}

	async answerSuggestExternalPostHandler(ctx, user) {
		const receivedExternalPost = ctx.update.message.text;
		const insertExternalPost = {
			post: receivedExternalPost,
			user_id: user.id,
			type: 'external',
			date: new Date().toISOString(),
		}
		await Mongodb.postDB.insertOne(insertExternalPost)

		await this.resetLastAction(user)

		return await ctx.telegram.sendMessage(ctx.chat.id, "Спасибо! Твоя новость принята и будет опубликована в ближайшее время!", {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})
	}

	async answerSuggestPrivatePostHandler(ctx, user) {
		const receivedPrivatePost = ctx.update.message.text;
		const insertPrivatePost = {
			post: receivedPrivatePost,
			user_id: user.id,
			type: 'private',
			date: new Date().toISOString(),
		}

		await Mongodb.postDB.insertOne(insertPrivatePost)

		await this.resetLastAction(user)

		return await ctx.telegram.sendMessage(ctx.chat.id, "Спасибо! Твоя новость принята и будет опубликована в ближайшее время!", {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})
	}

	async answerSpeechHandler(ctx, user) {
		const receivedSpeech = ctx.update.message.text;
		const insertSpeech = {
			speech: receivedSpeech,
			user_id: user.id,
			date: new Date().toISOString(),
		}
		await Mongodb.speechDB.insertOne(insertSpeech)

		await this.resetLastAction(user)

		const theNote = '<a href="https://www.notion.so/foodtech-x5/8098da36c0474833ad5018c879b754b9">памятку для проведения воркшопов</a>'

		return await ctx.telegram.sendMessage(ctx.chat.id, `Принято! Держи нашу ${theNote} 😀`, {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
			parse_mode:'HTML'
		})
	}

	async sendSimpleMessage(ctx, userName) {
		const unidentifiedMessage = userName ? `Не понимаю, что ты хочешь ${userName} 😭 `: 'Не понимаю, что ты хочешь 😭';
		await ctx.telegram.sendMessage(ctx.chat.id, unidentifiedMessage)
	}

	async answerQuestionHandler(ctx, user) {
		const askedQuestion = ctx.update.message.text;
		const insertQuestion = {
			question: askedQuestion,
			user_id: user.id,
			date: new Date().toISOString(),
		}
		await Mongodb.questionsBD.insertOne(insertQuestion)

		await this.resetLastAction(user)

		return await ctx.telegram.sendMessage(ctx.chat.id, 'Я тебя услышал, отвечу в ближайшее время!💪',{
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},

		})
	}

	async answerIdeaHandler(ctx, user) {
		const receivedIdea = ctx.update.message.text;
		const insertIdea = {
			idea: receivedIdea,
			user_id: user.id,
			date: new Date().toISOString(),
		}
		await Mongodb.ideasBD.insertOne(insertIdea)

		await this.resetLastAction(user)

		return await ctx.telegram.sendMessage(ctx.chat.id, 'Я тебя услышал, на следующей встрече мы обязательно обсудим твои идеи и найдем лучший способ их реализации!💪', {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},

		})
	}

	async resetLastAction(user) {
		await Mongodb.userBD.updateOne({id: user.id}, {
			$unset:{
				current_action: ''
			}
		});
	}
}

const msgHandler = new MessagesHandler();
module.exports = msgHandler;
