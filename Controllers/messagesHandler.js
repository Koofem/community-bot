const lodash = require('../lodash');
const messages = require('Constants/message');
const actions = require('Constants/actions');
const {
	findUserName,
	resetLastAction,
	saveOrUpdateUser,
	checkIsAdmin,
	findAllUsers,
	setActionToUser,
	getAllUsers,
	resetUserAction,
	findUser,
	checkCurrentAction,
	getPhotoID,
	getAllQuestions,
	writeNewQuestion,
	makeNotionQuestionPage,
	getAllIdeas,
	writeNewIdea,
	makeNotionIdeaPage,
	getAllSpeech,
	writeNewSpeech,
	makeNotionSpeechPage,
	getAllPosts,
	writeNewPost,
	makeNotionPostPage,
	findQuestion,
	findUserById,
	setActionWithPropertyToUser,
	updateQuestionAnswer,
	updateQuestionNotion,
} = require('Helpers/helpers')

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
		const timeout = setTimeout(() =>  {
			ctx.telegram.sendMessage(ctx.chat.id, 'Думаю, может быть долго....');
		}, 500)

		const promises = usersArr.map(user => {
			return new Promise((res)=> {
				return res(ctx.telegram.sendMessage(ctx.chat.id, `Имя: ${user.first_name} \nФамилия: ${user.last_name} \nНик: @${user.username}\nАдмин или нет🤔: ${user.admin ? 'Админ': 'не админ'}`));
			})
		})
		return Promise.all(promises).then(()=> {
			clearInterval(timeout);

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

	async newsletterMessageHandler(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await ctx.telegram.sendMessage(ctx.chat.id, 'Отлично, выбери куда хочешь написать', {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: messages.NEWSLETTERTOPRIVATECHANNEL,
								callback_data: actions.NEWSLETTERTOPRIVATECHANNEL
							},
							{
								text: messages.NEWSLETTERTOEXTERNALCHANNEL,
								callback_data: actions.NEWSLETTERTOEXTERNALCHANNEL
							},
							{
								text: messages.NEWSLETTERTOALL,
								callback_data: actions.NEWSLETTERALL
							},
							]
					],
				},
				resize_keyboard: true,
			})
		} else {
			const msg = 'ты немного ошибся, скорее всего тебе нужно другое меню!:)'
			return this.showRegularMenu(ctx, msg);
		}
	}

	async newsLetterToAllHandler(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await setActionToUser(ctx.from, actions.NEWSLETTERALL);
			await ctx.telegram.sendMessage(ctx.chat.id, 'Следующее сообщение будет отправлено во все каналы, осторожнее со словами и картинками!:)', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		}
	}

	async newsLetterToExternalChannel(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await setActionToUser(ctx.from, actions.NEWSLETTERTOEXTERNALCHANNEL);
			await ctx.telegram.sendMessage(ctx.chat.id, 'Следующее сообщение будет отправлено в канал X5 Tech News, осторожнее со словами и картинками!:)', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		}
	}

	async newsLetterToPrivateChannel(ctx) {
		const user = await findUser(ctx.from);
		if (checkIsAdmin(user)) {
			await setActionToUser(ctx.from, actions.NEWSLETTERTOPRIVATECHANNEL);
			await ctx.telegram.sendMessage(ctx.chat.id, 'Следующее сообщение будет отправлено в канал X5 Tech Community, осторожнее со словами и картинками!:)', {
				reply_markup: {
					keyboard: [
						[messages.BACK]
					],
					resize_keyboard: true,
				},
			})
		}
	}

	async answerMassiveMessageHandler(ctx, user) {
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
		const notion = 'https://www.notion.so/foodtech-x5/15a362b1538f4b53895e19721911fa41'
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
						[messages.GETNOTIONDATABASE, messages.NEWSLETTER],
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
		const techNewsLink = '<a href="https://t.me/joinchat/TzL23fprszHePDo5">Канала в телеграм X5 Tech News</a>'
		const communityLink = '<a href="https://t.me/joinchat/S87gOoavoRmhet1O">Канала в телеграм X5 Tech Community</a>'
		const Olya = '<a href="https://t.me/opastuk">Оля Пастухова</a>'
		const Nikita = '<a href="https://t.me/NickPanormov">Никита Панормов</a>'
		const Tolya = '<a href="https://t.me/ababin71517">Толя Бабин</a>'
		const ZOOM = '<a href="https://us02web.zoom.us/j/5887041256">ЗДЕСЬ</a>'
		const message = "Это просто здорово! Сейчас наше комьюнити состоит из: \n\n" + techNewsLink + ", куда мы публикуем самые интересные новости с просторов технического мира.\n\n" +
			communityLink + ", куда мы публикуем всякие интересные внутренности, а так же записи всех выступлений, проводимых комьюнити. Если ты решил сложную рабочую задачу, придумали что-то крутое и просто хочешь поделиться новинками в команде, то тебе сюда!\n\n" +
			'<b>Каждую среду в 14:00</b> мы собираемся ' + `<b>${ZOOM}</b>` + ' ,общаемся, воркшопимся и веселимся\n\n' + 'https://us02web.zoom.us/j/5887041256 | <b>Болталка (935030 код организатора)</b>\n\n' + 'Модератором комьюнити является ' + Olya + ', по любым вопросам и предложениям можешь писать ей напрямую, она будет рада ответить. Большую поддержку комьюнити так же оказывают ' + Nikita + ', и '+ Tolya +', они ведут свои рубрики и делают очень много крутого для нас.\n\n' +
			'(https://www.notion.so/11129fe6272a4e3bb3353c7daeb2854b) Более полная инфа вот тут и в закрепе паблика коомьюнити. Ознакомься обязательно!\n\n' + 'Но сердце комьюнити - это ты! Каждый из нас - одинаково важная часть команды. Давайте делиться знаниями, развиваться и учиться вместе! Здесь всех любят ❤️'

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
					case actions.NEWSLETTERALL:
						return this.answerNewsletterAllHandler(ctx,user)
					case actions.NEWSLETTERTOEXTERNALCHANNEL:
						return this.answerNewsletterExternalChannel(ctx,user)
					case actions.NEWSLETTERTOPRIVATECHANNEL: {
						return this.answerNewsletterPrivateChannel(ctx,user)
					}
					case actions.SELECTQUESTION:
						return this.selectedQuestionHandler(ctx, user)
					case actions.ANSEWERINGQEUSTION:
						return this.answeringQuestionHandler(ctx, user)
				}
		} else {
			return await this.sendSimpleMessage(ctx, await findUserName(user));
		}
	}

	async answerNewsletterAllHandler(ctx, user) {
		const massiveMessage = ctx.update.message.text;
		await resetUserAction(user)
		const timeout = setTimeout(()=> {
			ctx.telegram.sendMessage(ctx.chat.id, 'Сообщения отправляются, это может занять время');
		}, 500)

		const channels = [process.env.PRIVATECHANNEL, process.env.EXTERNALCHANNEL]

		const promises = channels.map((channel) => {
			return new Promise((resolve) => {
				ctx.telegram.sendMessage(channel, massiveMessage).then(()=> {
					return resolve();
				})
			})
		})

		Promise.all(promises).then(() => {
			clearInterval(timeout)
			const msg = 'Готово!'
			return this.showAdminMenu(ctx, msg);
		})
	}

	async answerNewsletterPrivateChannel(ctx, user) {
		const massiveMessage = ctx.update.message.text;
		await resetUserAction(user)
		const timeout = setTimeout(()=> {
			ctx.telegram.sendMessage(ctx.chat.id, 'Сообщения отправляются, это может занять время');
		}, 500)

		const channels = [process.env.PRIVATECHANNEL]

		const promises = channels.map((channel) => {
			return new Promise((resolve) => {
				ctx.telegram.sendMessage(channel, massiveMessage).then(()=> {
					return resolve();
				})
			})
		})

		Promise.all(promises).then(() => {
			clearInterval(timeout)
			const msg = 'Готово!'
			return this.showAdminMenu(ctx, msg);
		})
	}

	async answerNewsletterExternalChannel(ctx, user) {
		const massiveMessage = ctx.update.message.text;
		await resetUserAction(user)
		const timeout = setTimeout(()=> {
			ctx.telegram.sendMessage(ctx.chat.id, 'Сообщения отправляются, это может занять время');
		}, 500)

		const channels = [process.env.EXTERNALCHANNEL]

		const promises = channels.map((channel) => {
			return new Promise((resolve) => {
				ctx.telegram.sendMessage(channel, massiveMessage).then(()=> {
					return resolve();
				})
			})
		})

		Promise.all(promises).then(() => {
			clearInterval(timeout)
			const msg = 'Готово!'
			return this.showAdminMenu(ctx, msg);
		})
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
		} else if (checkIsAdmin(user) && lodash.get(user, 'current_action', false ) === actions.NEWSLETTERALL) {
			await resetLastAction(user);
			const channels = [process.env.PRIVATECHANNEL, process.env.EXTERNALCHANNEL]
			const massiveMessage = ctx.update.message.caption ? ctx.update.message.caption : '';
			const promises = channels.map((channel) => {
				return new Promise((resolve)=> {
					return ctx.telegram.sendPhoto(channel, photoID, {
						caption: massiveMessage,
						disable_notification: true,
					}).then(()=> {
						return resolve();

					})
				})
			});
			await Promise.all(promises).then(() => {
				clearInterval(timeout)
				const msg = 'Готово!'
				return this.showAdminMenu(ctx, msg);
			})

		} else if (checkIsAdmin(user) && lodash.get(user, 'current_action', false ) === actions.NEWSLETTERTOEXTERNALCHANNEL) {
			await resetLastAction(user);
			const channels = [process.env.EXTERNALCHANNEL]
			const massiveMessage = ctx.update.message.caption ? ctx.update.message.caption : '';
			const promises = channels.map((channel) => {
				return new Promise((resolve) => {
					return ctx.telegram.sendPhoto(channel, photoID, {
						caption: massiveMessage,
						disable_notification: true,
					}).then(() => {
						return resolve();

					})
				})
			});
			await Promise.all(promises).then(() => {
				clearInterval(timeout)
				const msg = 'Готово!'
				return this.showAdminMenu(ctx, msg);
			})

		} else if (checkIsAdmin(user) && lodash.get(user, 'current_action', false ) === actions.NEWSLETTERTOPRIVATECHANNEL) {
			await resetLastAction(user);
			const channels = [process.env.PRIVATECHANNEL]
			const massiveMessage = ctx.update.message.caption ? ctx.update.message.caption : '';
			const promises = channels.map((channel) => {
				return new Promise((resolve)=> {
					return ctx.telegram.sendPhoto(channel, photoID, {
						caption: massiveMessage,
						disable_notification: true,
					}).then(()=> {
						return resolve();

					})
				})
			});
			await Promise.all(promises).then(() => {
				clearInterval(timeout)
				const msg = 'Готово!'
				return this.showAdminMenu(ctx, msg);
			})

		}		else {
			const msg = 'картинки не принимаю 🙈'
			return this.showRegularMenu(ctx, msg);
		}
	}

	async answerSuggestExternalPostHandler(ctx, user) {
		const posts = await getAllPosts();
		const index = posts.length + 1;
		const receivedExternalPost = ctx.update.message.text;
		const insertExternalPost = {
			post: receivedExternalPost,
			user_id: user.id,
			type: 'external',
			date: new Date().toISOString(),
			index: index
		}
		await writeNewPost(insertExternalPost)

		await resetLastAction(user)

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

		const pageID = await makeNotionPostPage(index,receivedExternalPost, user, 'public')
		await ctx.telegram.sendMessage(187860941, `Великая Оля, произошло новое событие, обратите свой взор на него: \n\nhttps://www.notion.so/foodtech-x5/${pageID.replace(/-/g, '')}`)
	}

	async answerSuggestPrivatePostHandler(ctx, user) {
		const posts = await getAllPosts();
		const index = posts.length + 1;
		const receivedPrivatePost = ctx.update.message.text;
		const insertPrivatePost = {
			post: receivedPrivatePost,
			user_id: user.id,
			type: 'private',
			date: new Date().toISOString(),
			index: index
		}

		await writeNewPost(insertPrivatePost)

		await resetLastAction(user)

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
		const pageID = await makeNotionPostPage(index,receivedPrivatePost, user, 'private')
		await ctx.telegram.sendMessage(187860941, `Великая Оля, произошло новое событие, обратите свой взор на него: \n\nhttps://www.notion.so/foodtech-x5/${pageID.replace(/-/g, '')}`)
	}

	async answerSpeechHandler(ctx, user) {
		const posts = await getAllSpeech();
		const index = posts.length + 1;
		const receivedSpeech = ctx.update.message.text;
		const insertSpeech = {
			speech: receivedSpeech,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index
		}
		await writeNewSpeech(insertSpeech)

		await resetLastAction(user)

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
		const pageID = await makeNotionSpeechPage(index, receivedSpeech, user)
		await ctx.telegram.sendMessage(187860941, `Великая Оля, произошло новое событие, обратите свой взор на него: \n\nhttps://www.notion.so/foodtech-x5/${pageID.replace(/-/g, '')}`)
	}

	async sendSimpleMessage(ctx, userName) {
		const unidentifiedMessage = userName ? `Не понимаю, что ты хочешь ${userName} 😭 `: 'Не понимаю, что ты хочешь 😭';
		await ctx.telegram.sendMessage(ctx.chat.id, unidentifiedMessage)
	}

	async selectedQuestionHandler(ctx, user) {
		const index = ctx.update.message.text
		const question = await findQuestion(index);
		if (question && !question.answered) {
			const userWhoAsked = await findUserById(question.user_id)
			await setActionWithPropertyToUser(user, actions.QUESTIONSELECTED, {questionIndex: index})
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
			const userWhoAsked = await findUser(question.user_id)
			const message = `Выбранный вопрос: \nАвтор: ${userWhoAsked.first_name} (@${userWhoAsked.username})\nОтвет получен: ${question.answered ? 'Да' : 'Нет'}\nВопрос: ${question.question}. \nОтвет: ${question.answer}`
			await ctx.telegram.sendMessage(ctx.chat.id, message);

		} else {
			await ctx.telegram.sendMessage(ctx.chat.id, 'Не нашел вопрос')
			await this.menuSelection(ctx,user);
		}
	}

	async selectQuestionHandler(ctx) {
		const user = await findUser(ctx.from)
		if (checkIsAdmin(user)) {
			await setActionToUser(user, actions.SELECTQUESTION)
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
		const question = await findQuestion(user.questionIndex)
		const notionPageID = question.notionPageID;
		const message = `Привет! Ты задавал(а) вопрос: \n${question.question}\nОтвечаю:\n${answer}`

		await updateQuestionAnswer(question.index, answer)
		await updateQuestionNotion(notionPageID, answer)

		await ctx.telegram.sendMessage(question.user_id, message, {parse_mode: 'HTML'});
		await resetLastAction(user);
		await ctx.telegram.sendMessage(ctx.chat.id, 'Ответ отправлен')
		await this.showAdminMenu(ctx);
	}

	async sayYesHandler(ctx) {
		const user = await findUser(ctx.from);
		const index = user.questionIndex
		if (user.current_action === actions.QUESTIONSELECTED) {
			await setActionWithPropertyToUser(user, actions.ANSEWERINGQEUSTION, {questionIndex: index})
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
		const user = await findUser(ctx.from)
		await ctx.telegram.sendMessage(ctx.chat.id, 'Ну как знаешь')
		await resetLastAction(user);
		await this.showAdminMenu(ctx);
	}

	async answerQuestionHandler(ctx, user) {
		const askedQuestion = ctx.update.message.text;
		const questions = await getAllQuestions();
		const index = questions.length + 1;
		const insertQuestion = {
			question: askedQuestion,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index,
			answered: false
		}
		await writeNewQuestion(insertQuestion)

		await resetLastAction(user)

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

		const pageID = await makeNotionQuestionPage(index, askedQuestion, user);
		await ctx.telegram.sendMessage(187860941, `Великая Оля, произошло новое событие, обратите свой взор на него: \n\nhttps://www.notion.so/foodtech-x5/${pageID.replace(/-/g, '')}`)
	}

	async answerIdeaHandler(ctx, user) {
		const ideas = await getAllIdeas();
		const index = ideas.length + 1;
		const idea = ctx.update.message.text;
		const insertIdea = {
			idea: idea,
			user_id: user.id,
			date: new Date().toISOString(),
			index: index
		}
		await writeNewIdea(insertIdea)

		await resetLastAction(user)

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

		const pageID = await makeNotionIdeaPage(index, idea, user);
		await ctx.telegram.sendMessage(187860941, `Великая Оля, произошло новое событие, обратите свой взор на него: \n\nhttps://www.notion.so/foodtech-x5/${pageID.replace(/-/g, '')}`)
	}

}

const msgHandler = new MessagesHandler();
module.exports = msgHandler;
