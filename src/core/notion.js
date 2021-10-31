const { Client } = require('@notionhq/client');
const Mongodb = require("./mongodb");

class Notion {
	constructor() {}
	client;

	async init() {
		return new Promise((resolve) => {
			this.client =  new Client({ auth: process.env.NOTION_TOKEN });
			return resolve();
		}).then(async()=> {
			console.log('Notion подключен');
		})
	}

	async createQuestionNotion(question, userID, index) {
		const userBD = await Mongodb.findUser(userID)
		const title = question.slice(0, 15);
		const userWhoAsked = `${userBD.first_name} (@${userBD.username})`;
		const response = await this.client.pages.create({
			parent: {
				database_id: process.env.NOTION_QUESTION_DATABASE_TOKEN
			},
			icon: {
				type: "emoji",
				emoji: "❓"
			},
			properties: {
				title: {
					title: [
						{
							text: {
								content: title + '...',
							},
						},
					],
				},
				"Статус": {
					select: {
					name: "Ожидает ответа"
					}
				},
				"Кто задал": {
					rich_text: [{
						text: {
							content: userWhoAsked
						}
					}],
				},
				"Индекс": {
					rich_text: [{
						text: {
							content: index.toString()
						}
					}],
				},
			},
			children: [
				{
					object: 'block',
					type: 'paragraph',
					paragraph: {
					text:[
						{
							type: 'text',
							text: {
								content: question
							}
						}
					]}
				}
			]
		})

		return response.id;
	}
	async updateQuestionNotion(notionID, answer) {
		console.log(answer)
	await this.client.pages.update({
			page_id: notionID,
			properties: {
				"Статус": {
					select: {
						name: "Ответ отправлен"
					}
				},
			},
		});
	await this.client.blocks.children.append({
		block_id: notionID,
		children: [
			{
				object: 'block',
				type: 'paragraph',
				paragraph: {
					text: [
						{type: 'text',
						text: {
							content: `Ответ на вопрос: ${answer}`
						}}
					]
				}
			}
		]
	})
	}

	async createPostNotion(post, userID, index, type) {
		const userBD = await Mongodb.findUser(userID)
		const title = post.slice(0, 15);
		const channel = type === 'private' ? 'Канал X5 Tech Community' : 'Канал X5 Tech News';
		const userWhoAsked = `${userBD.first_name} (@${userBD.username})`;
		const response = await this.client.pages.create({
			parent: {
				database_id: process.env.NOTION_POSTS_DATABASE_TOKEN
			},
			icon: {
				type: "emoji",
				emoji: "📰"
			},
			properties: {
				title: {
					title: [
						{
							text: {
								content: title + '...',
							},
						},
					],
				},
				"Статус": {
					select: {
						name: "Ожидает публикации"
					}
				},
				"Автор": {
					rich_text: [{
						text: {
							content: userWhoAsked
						}
					}],
				},
				"Индекс": {
					rich_text: [{
						text: {
							content: index.toString()
						}
					}],
				},
				"Канал": {
					select: {
						name: `${channel}`
					}
				},
			},
			children: [
				{
					object: 'block',
					type: 'paragraph',
					paragraph: {
						text:[
							{
								type: 'text',
								text: {
									content: post
								}
							}
						]}
				}
			]
		})

		return response.id;
	}
}

const notionApi = new Notion();
module.exports = notionApi;

