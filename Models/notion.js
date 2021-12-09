const { Client } = require('@notionhq/client');

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

	async createQuestionNotion(question, index, userBD) {
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

	async createPostNotion(post, userBD, index, type) {
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

	async createSpeechNotion(speech, userBD, index) {
		const title = speech.slice(0, 15);
		const userWhoAsked = `${userBD.first_name} (@${userBD.username})`;
		const response = await this.client.pages.create({
			parent: {
				database_id: process.env.NOTION_SPEECH_DATABASE_TOKEN
			},
			icon: {
				type: "emoji",
				emoji: "🎙"
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
						name: "Ожидает подтверждения"
					}
				},
				"Выступающий": {
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
									content: speech
								}
							}
						]}
				}
			]
		})

		return response.id;
	}

	async createIdeasNotion(idea, userBD, index) {
		const title = idea.slice(0, 15);
		const userWhoAsked = `${userBD.first_name} (@${userBD.username})`;
		const response = await this.client.pages.create({
			parent: {
				database_id: process.env.NOTION_IDEA_DATABASE_TOKEN
			},
			icon: {
				type: "emoji",
				emoji: "🎙"
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
						name: "Ожидает подтверждения"
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
									content: idea
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

