// const Mongodb = require('../src/core/mongodb');
const lodash = require('../lodash');
const messages = require('Constants/message');
const actions = require('Constants/actions');
const userBD = require('Models/MongoBD/UserBD')
const {findUserName, resetLastAction, saveOrUpdateUser, checkIsAdmin, findAllUsers,
	setActionToUser, getAllUsers, resetUserAction, findUser, checkCurrentAction,getPhotoID} = require('Helpers/helpers')
// const notion = require('../src/core/notion')

const MESSAGE_LIMIT = 4096;

class MessagesHandler {
	async restartAndStartCommandHandler(ctx) {
		await saveOrUpdateUser(ctx.from)
		await resetLastAction(ctx.from);
		await this.menuSelection(ctx);
	}

	async menuSelection(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			return this.showMenuSelection(ctx)
		} else {
			return this.showRegularMenu(ctx);
		}
	}

	async showMenuSelection(ctx) {
		const userName = await findUserName(ctx.from);
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


	async getUsersHandler(ctx) {
		const usersArr = await findAllUsers();
		let message = '';
		const timeout = setTimeout(() =>  {
			ctx.telegram.sendMessage(ctx.chat.id, 'Думаю, может быть долго....');
		}, 500)

		const promises = usersArr.map(user => {
			return new Promise((res)=> {
					message = message + `Имя: ${user.first_name} \nФамилия: ${user.last_name} \nНик: @${user.username}\nАдмин или нет🤔: ${user.admin ? 'Админ': 'не админ'}  \n\n\n`
					return res();

			})
		})
		return Promise.all(promises).then(()=> {
			clearInterval(timeout);
			ctx.telegram.sendMessage(ctx.chat.id, message)
		});


	}

	async massiveMessageHandler(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await setActionToUser(ctx.from, actions.MASSIVEMESSAGE)
			await ctx.telegram.sendMessage(ctx.chat.id, 'Следующее сообщение будет отправлено всем, у кого запущен бот, осторожнее со словами и картинками!:)', {
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
		console.log('f')
		const usersArr = await getAllUsers();
		const massiveMessage = ctx.update.message.text;
		await resetUserAction(user)
		const timeout = setTimeout(()=> {
			ctx.telegram.sendMessage(ctx.chat.id, 'Сообщения отправляются, это может занять время');
		}, 500)

		const promises = usersArr.map((user) => {
			return new Promise((resolve) => {
				ctx.telegram.sendMessage(user.id, massiveMessage).then(()=> {
					return resolve();
				})
			})
		})

		Promise.all(promises).then(() => {
			clearInterval(timeout)
			const msg = 'Сообщения отправились, даже тебе, поздравляю!'
			return this.showAdminMenu(ctx, msg);
		})
	}

	async getNotion(ctx) {
		//TODO->ПОМЕНЯТЬ ССЫЛКУ
		const notion = 'https://rainbow-pantry-fcd.notion.site/Community-febc3168af11445bad0e9ba79df5a5f4'
		const msg=`Забирай\n${notion}`
		await ctx.telegram.sendMessage(ctx.chat.id, msg, {parse_mode: 'HTML'})

	}

	async showAdminMenu(ctx, extraMsg) {
		const msg = 'Доступные функции';
		const sendMessage = extraMsg ? extraMsg : msg
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await ctx.telegram.sendMessage(ctx.chat.id, sendMessage, {
				reply_markup: {
					keyboard: [
						[messages.MASSIVEMESSAGE, messages.GETALLUSERS],
						[messages.GETNOTIONDATABASE],
						[messages.SELECTQUESTION],
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
		const userName = await findUserName(ctx.from)
		const msg = "чем я могу помочь?";
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
		//TODO->ПРОВЕРИТЬ ССЫЛКУ
		const link = '<a href="https://foodtech-x5.notion.site/1cbcc45d54f54514ba5dcf7289314632">ссылке</a>'
		await ctx.telegram.sendMessage(ctx.chat.id, 'Супер, за нашим расписанием можно следить по '+ link, {
			parse_mode:'HTML'
		})
	}

	async informationHandler(ctx) {
		//TODO-> ПОПРАВИТЬ (НОВОЕ ОПИСАНИЕ)
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
		const userName = await findUserName(ctx.from);
		const msg = userName ? `${userName}, слушаю тебя! \nНапиши вопрос одним предложением!`: 'Слушаю тебя!\n Напиши вопрос одним предложением!';
		await setActionToUser(ctx.from, actions.ASKQUESTION);

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
		const userName = await findUserName(ctx.from);
		const msg = userName ? `${userName}, это просто потрясающе! В рамках комьюнити мы проводим как и небольшие воркшопы (15-40 минут), так более серьезные выступления для всего X5 FoodTech. Опиши свою идею одним сообщением, и мы с тобой свяжемся, чтобы выбрать удобный формат и дату!`:
			'Это просто потрясающе! В рамках комьюнити мы проводим как и небольшие воркшопы (15-40 минут), так более серьезные выступления для всего X5 FoodTech. Опиши свою идею одним сообщением, и мы с тобой свяжемся, чтобы выбрать удобный формат и дату!';
		await setActionToUser(ctx.from, actions.IWANTTOSPEAK);
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
		const userName = await findUserName(ctx.from);
		const msg = userName ? `${userName}, замечательно! Мы прислушиваемся ко всем комментариям аудитории. Опиши пожалуйста мне все одним сообщением 🙂`:
			'Замечательно! Мы прислушиваемся ко всем комментариям аудитории. Опиши пожалуйста мне все одним сообщением 🙂';
		await setActionToUser(ctx.from, actions.GIVEIDEA);
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
		const msg = "Я тебя услышал. Пожалуйста, опиши свою новость в одном сообщении, прикрепи требуемые ссылки, изображения также прошу тебя прислать ссылкой на внешний ресурс, иначе я не смогу их принять ☹️"
		await setActionToUser(ctx.from, actions.SUGGESTEXTERNALPOST);
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
		const msg = "Я тебя услышал. Пожалуйста, опиши свою новость в одном сообщении, прикрепи требуемые ссылки, изображения также прошу тебя прислать ссылкой на внешний ресурс, иначе я не смогу их принять ☹️"
		await setActionToUser(ctx.from, actions.SUGGESTPRIVATEPOST);

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
		const userName = await findUserName(ctx.from);
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
		const user = await findUser(ctx.from)
		if (checkCurrentAction(user)) {
				switch (user.current_action) {
					case actions.ASKQUESTION:
						return this.answerQuestionHandler(ctx, user);
					case actions.GIVEIDEA:
						return this.answerIdeaHandler(ctx, user);
					case actions.IWANTTOSPEAK:
						return this.answerSpeechHandler(ctx, user);
					case actions.SUGGESTEXTERNALPOST:
						return this.answerSuggestExternalPostHandler(ctx, user);
					case actions.SUGGESTPRIVATEPOST:
						return this.answerSuggestPrivatePostHandler(ctx, user);
					case actions.MASSIVEMESSAGE:
						return this.answerMassiveMessageHandler(ctx, user);
					case actions.SELECTQUESTION:
						return this.selectedQuestionHandler(ctx, user)
					case actions.ANSEWERINGQEUSTION:
						return this.answeringQuestionHandler(ctx, user)
				}
		} else {
			return await this.sendSimpleMessage(ctx, await findUserName(user));
		}
	}

	async photoMessageHandler(ctx) {
		const timeout = setTimeout(()=> {
			ctx.telegram.sendMessage(ctx.chat.id, 'Сообщения отправляются, это может занять время');
		}, 500)
		let photoID = null
		await getPhotoID(ctx).then((id) => {
			photoID = id
		}).catch((e)=> {
			return ctx.telegram.sendMessage(ctx.chat.id, `Что-то пошло не так, ошибка: ${e}`)
		})
		const user = await findUser(ctx.from)
		const usersArr = await getAllUsers();
		if (checkIsAdmin(user) && lodash.get(user, 'current_action', false ) === actions.MASSIVEMESSAGE) {
			await resetLastAction(user);
			const massiveMessage = ctx.update.message.caption ? ctx.update.message.caption : '';
			const promises = usersArr.map((user) => {
				return new Promise((resolve)=> {
					 return ctx.telegram.sendPhoto(user.id, photoID, {
						caption: massiveMessage,
						disable_notification: true,
					}).then(()=> {
							return resolve();

					 })
				})
			});

			await Promise.all(promises).then(() => {
				clearInterval(timeout)
				const msg = 'Сообщения отправились, даже тебе, поздравляю!'
				return this.showAdminMenu(ctx, msg);
			})
		} else {
			const msg = 'картинки не принимаю 🙈'
			return this.showRegularMenu(ctx, msg);
		}
	}

	async answerSuggestExternalPostHandler(ctx, user) {
		const posts = await Mongodb.getAllPost();
		const index = posts.length + 1;
		const receivedExternalPost = ctx.update.message.text;
		const insertExternalPost = {
			post: receivedExternalPost,
			user_id: user.id,
			type: 'external',
			date: new Date().toISOString(),
			index: index
		}
		await Mongodb.postDB.insertOne(insertExternalPost)

		await this.resetLastAction(user)

		await ctx.telegram.sendMessage(ctx.chat.id, "Спасибо! Твоя новость принята и будет опубликована в ближайшее время!", {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})

		await this.makeNotionPostPage(index,receivedExternalPost, user.id, 'public')
	}

	async answerSuggestPrivatePostHandler(ctx, user) {
		const posts = await Mongodb.getAllPost();
		const index = posts.length + 1;
		const receivedPrivatePost = ctx.update.message.text;
		const insertPrivatePost = {
			post: receivedPrivatePost,
			user_id: user.id,
			type: 'private',
			date: new Date().toISOString(),
			index: index
		}

		await Mongodb.postDB.insertOne(insertPrivatePost)

		await this.resetLastAction(user)

		await ctx.telegram.sendMessage(ctx.chat.id, "Спасибо! Твоя новость принята и будет опубликована в ближайшее время!", {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})
		await this.makeNotionPostPage(index,receivedPrivatePost, user.id, 'private')
	}

	async answerSpeechHandler(ctx, user) {
		const posts = await Mongodb.getAllSpeech();
		const index = posts.length + 1;
		const receivedSpeech = ctx.update.message.text;
		const insertSpeech = {
			speech: receivedSpeech,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index
		}
		await Mongodb.speechDB.insertOne(insertSpeech)

		await this.resetLastAction(user)

		const theNote = '<a href="https://www.notion.so/foodtech-x5/8098da36c0474833ad5018c879b754b9">памятку для проведения воркшопов</a>'

		 await ctx.telegram.sendMessage(ctx.chat.id, `Принято! Держи нашу ${theNote} 😀`, {
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
		await this.makeNotionSpeechPage(index, receivedSpeech, user.id)
	}

	async sendSimpleMessage(ctx, userName) {
		const unidentifiedMessage = userName ? `Не понимаю, что ты хочешь ${userName} 😭 `: 'Не понимаю, что ты хочешь 😭';
		await ctx.telegram.sendMessage(ctx.chat.id, unidentifiedMessage)
	}

	async selectedQuestionHandler(ctx, user) {
		const index = ctx.update.message.text
		const question = await Mongodb.findQuestion(index);
		if (question && !question.answered) {
			const userWhoAsked = await Mongodb.findUser(question.user_id)
			await Mongodb.userBD.updateOne({id: user.id}, {
				$set: {
					current_action: {
						action: 'question_selected',
						questionIndex: index
					},
				}
			})
			const message = `Выбранный вопрос: \nАвтор: ${userWhoAsked.first_name} (@${userWhoAsked.username})\nОтвет получен: ${question.answered ? 'Да' : 'Нет'}\nВопрос: ${question.question}. \nБудете отвечать?`
			await ctx.telegram.sendMessage(ctx.chat.id, message, {
				reply_markup: {
					keyboard: [
						[messages.SAYYES, messages.SAYNO],
						[messages.BACK]
					],
					resize_keyboard: true,
				},
				parse_mode: 'HTML'
			})
		} else if(question && question.answered) {
			const userWhoAsked = await Mongodb.findUser(question.user_id)
			const message = `Выбранный вопрос: \nАвтор: ${userWhoAsked.first_name} (@${userWhoAsked.username})\nОтвет получен: ${question.answered ? 'Да' : 'Нет'}\nВопрос: ${question.question}. \nОтвет: ${question.answer}`
			await ctx.telegram.sendMessage(ctx.chat.id, message);

		} else {
			await ctx.telegram.sendMessage(ctx.chat.id, 'Не нашел вопрос')
			await this.menuSelection(ctx,user);
		}
	}

	async selectQuestionHandler(ctx) {
		const user = await Mongodb.findUser(ctx.from.id)
		if (this.checkIsAdmin(user)) {
			await Mongodb.userBD.updateOne({id: user.id}, {
				$set: {
					current_action: {
						action: 'select_question',
					},
				}
			})
			await ctx.telegram.sendMessage(ctx.chat.id, 'Напишите индекс вопроса цифрой', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		}
	}

	async answeringQuestionHandler(ctx, user) {
		const answer = ctx.update.message.text
		const question = await Mongodb.findQuestion(user.current_action.questionIndex)
		const notionPageID = question.notionPageID;
		const message = `Привет! Ты задавал(а) вопрос: \n${question.question}\nОтвечаю:\n${answer}`

		await Mongodb.updateQuestionAnswer(question.index, answer)
		await notion.updateQuestionNotion(notionPageID, answer)

		await ctx.telegram.sendMessage(question.user_id, message, {parse_mode: 'HTML'});
		await this.resetLastAction(user);
		await ctx.telegram.sendMessage(ctx.chat.id, 'Ответ отправлен')
		await this.showAdminMenu(ctx);
	}

	async sayYesHandler(ctx) {
		const user = await Mongodb.findUser(ctx.from.id);
		const index = user.current_action.questionIndex
		if (user.current_action.action === action.QUESTIONSELECTED) {
			await Mongodb.userBD.updateOne({id: user.id}, {
				$set: {
					current_action: {
						action: 'answering_question',
						questionIndex: index,
					},
				}
			})
			await ctx.telegram.sendMessage(ctx.chat.id, 'Отлично, напишите ответ на выбранный ответ и он будет автоматически отправлен человеку, который его задал.', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
				parse_mode: 'HTML'
			})
		}
	}

	async sayNoHandler(ctx) {
		const user = await Mongodb.findUser(ctx.from.id)
		await ctx.telegram.sendMessage(ctx.chat.id, 'Ну как знаешь')
		await this.resetLastAction(user);
		await this.showAdminMenu(ctx);
	}

	async answerQuestionHandler(ctx, user) {
		const askedQuestion = ctx.update.message.text;
		const questions = await Mongodb.getAllQuestions();
		const index = questions.length + 1;
		const insertQuestion = {
			question: askedQuestion,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index,
			answered: false
		}
		await Mongodb.questionsBD.insertOne(insertQuestion)

		await this.resetLastAction(user)

		 await ctx.telegram.sendMessage(ctx.chat.id, `Я тебя услышал, твой вопрос номер: ${index}. Отвечу в ближайшее время!💪`,{
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})

		await this.makeNotionQuestionPage(index, askedQuestion, user.id)
	}

	async answerIdeaHandler(ctx, user) {
		const ideas = await Mongodb.getAllIdeas();
		const index = ideas.length + 1;
		const receivedIdea = ctx.update.message.text;
		const insertIdea = {
			idea: receivedIdea,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index
		}
		await Mongodb.ideasBD.insertOne(insertIdea)

		await this.resetLastAction(user)

		await ctx.telegram.sendMessage(ctx.chat.id, 'Я тебя услышал, на следующей встрече мы обязательно обсудим твои идеи и найдем лучший способ их реализации!💪', {
			reply_markup: {
				keyboard: [
					[messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
					[messages.TIMETABLE, messages.INFORMATION],
					[messages.GIVEIDEA,messages.ASKQUESTION],
				],
				resize_keyboard: true,
			},
		})

		await this.makeNotionIdeaPage(index, receivedIdea, user.id)
	}



	//Добавление в Notion
	async makeNotionQuestionPage(index, question, userID) {
		const pageID = await notion.createQuestionNotion(question, userID, index)
		return await Mongodb.updateQuestionNotionPageID(index,pageID);
	}

	async makeNotionPostPage(index, post, userID, type) {
		const pageID = await notion.createPostNotion(post, userID, index, type)
		return await Mongodb.updatePostNotionPageID(index,pageID);
	}

	async makeNotionSpeechPage(index, speech, userID) {
		const pageID = await notion.createSpeechNotion(speech, userID, index)
		return await Mongodb.updateSpeechNotionPageID(index,pageID);
	}

	async makeNotionIdeaPage(index, idea, userID) {
		const pageID = await notion.createIdeasNotion(idea, userID, index)
		return await Mongodb.updateIdeasPageID(index, pageID);
	}

}

const msgHandler = new MessagesHandler();
module.exports = msgHandler;