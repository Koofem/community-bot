const { Telegraf } = require('telegraf')
const fs = require('fs')
require('dotenv')
const messages = require('../../message');
const msgHandler = require('./messagesHandler')


class TelegramBot {
  constructor() {}
  bot = new Telegraf(process.env.BOT_TOKEN)

  async init() {
    await msgHandler.initMongodb();
    await this.startListening();
  }

startListening() {
  this.bot.start((ctx) => msgHandler.restartAndStartCommandHandler(ctx))

  this.bot.command('restart', (ctx) => msgHandler.restartAndStartCommandHandler(ctx));

  this.bot.hears(messages.TIMETABLE, (ctx) => msgHandler.timeTableHandler(ctx));

  this.bot.hears(messages.INFORMATION, (ctx) => msgHandler.informationHandler(ctx));

  this.bot.hears(messages.ASKQUESTION, (ctx)=> msgHandler.askQuestionHandler(ctx));

  this.bot.hears(messages.GIVEIDEA, (ctx)=> msgHandler.giveIdeaHandler(ctx))

  this.bot.hears(messages.SUGGESTNEWS, (ctx)=> msgHandler.suggestNewsHandler(ctx))

  this.bot.hears(messages.EXTERNALCHANNEL, (ctx)=> msgHandler.suggestExternalPostHandler(ctx))

  this.bot.hears(messages.PRIVATECHANNEL, (ctx)=> msgHandler.suggestPrivatePostHandler(ctx))

  this.bot.hears(messages.IWANTTOSPEAK,(ctx)=> msgHandler.speechHandler(ctx));

  this.bot.hears(messages.BACK,(ctx)=> msgHandler.restartAndStartCommandHandler(ctx));

  this.bot.hears(messages.REGULARMENU, ctx => msgHandler.showRegularMenu(ctx));

  this.bot.hears(messages.ADMINMENU, ctx=> msgHandler.showAdminMenu(ctx));

  this.bot.hears(messages.MASSIVEMESSAGE, ctx=> msgHandler.massiveMessageHandler(ctx));

  this.bot.hears(messages.GETALLUSERS, ctx=> msgHandler.getUsersHandler(ctx));

  this.bot.on('text', (ctx) =>msgHandler.simpleMessageHandler(ctx));

  this.bot.on('photo', (ctx) => msgHandler.photoMessageHandler(ctx));


  this.bot.launch().then(()=> {
    console.log('Бот запущен')
  })
}
}

const telegramBot = new TelegramBot();
module.exports = telegramBot;
