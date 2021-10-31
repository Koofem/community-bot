const { Telegraf } = require('telegraf')
const fs = require('fs')
require('dotenv')
const messages = require('../../message');
const msgHandler = require('./messagesHandler')
const Mongodb = require("./mongodb");
const Notion = require("./notion");


class TelegramBot {
  constructor() {}
  bot = new Telegraf(process.env.BOT_TOKEN)

  async init() {
    await Mongodb.init();
    await this.startListening();
    await Notion.init();
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

  this.bot.hears(messages.GETNOTIONDATABASE, ctx => msgHandler.getNotion(ctx))

  this.bot.hears(messages.MASSIVEMESSAGE, ctx=> msgHandler.massiveMessageHandler(ctx));

  this.bot.hears(messages.GETALLUSERS, ctx=> msgHandler.getUsersHandler(ctx));

  this.bot.hears(messages.SELECTQUESTION, ctx=> msgHandler.selectQuestionHandler(ctx));

  this.bot.hears(messages.SAYYES, ctx=> msgHandler.sayYesHandler(ctx));

  this.bot.hears(messages.SAYNO, ctx=> msgHandler.sayNoHandler(ctx));

  this.bot.on('text', (ctx) =>msgHandler.simpleMessageHandler(ctx));

  this.bot.on('photo', (ctx) => msgHandler.photoMessageHandler(ctx));


  this.bot.launch().then(()=> {
    console.log('Все заебись, бот запущен')
  })
}
}

const telegramBot = new TelegramBot();
module.exports = telegramBot;
