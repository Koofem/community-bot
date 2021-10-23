const { Telegraf } = require('telegraf')
const Mongodb = require('./mongodb')
const fs = require('fs')
require('dotenv')
const messages =require('../message');


class TelegramBot {
  constructor() {}
  bot = new Telegraf(process.env.BOT_TOKEN)

  async initMongodb() {
    await Mongodb.init()
  }

  async init() {
    await this.initMongodb();
    this.startListening();
  }

startListening() {
  this.bot.start((ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "Чем я могу помочь?", {
      reply_markup: {
        keyboard: [
          [messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
          [messages.TIMETABLE, messages.INFORMATION],
          [messages.GIVEIDEA, messages.ASKQUESTION],
        ],
      }
    })
  })

  this.bot.command('restart', (ctx)=> {
    ctx.telegram.sendMessage(ctx.chat.id, "Чем я могу помочь?", {
      reply_markup: {
        keyboard: [
          [messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
          [messages.TIMETABLE, messages.INFORMATION],
          [messages.GIVEIDEA,messages.ASKQUESTION],
        ],
      },
      resize_keyboard: true,
    })
  })

  this.bot.hears(messages.TIMETABLE, (ctx) => {
    const link = '<a href="https://juvenile-sailboat-95a.notion.site/f4f58fecffe4486c92649de506483d4b">ссылке</a>'
    ctx.telegram.sendMessage(ctx.chat.id, 'Супер, за нашим расписанием можно следить по '+ link, {
      parse_mode:'HTML'
    })
  })

  this.bot.hears(messages.INFORMATION, (ctx) => {
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

    ctx.telegram.sendMessage(ctx.chat.id, message, {
      parse_mode:'HTML'
    })
  })

  this.bot.hears(messages.BACK,(ctx)=> {
    ctx.telegram.sendMessage(ctx.chat.id, "Чем я могу помочь?", {
      reply_markup: {
        keyboard: [
          [messages.SUGGESTNEWS, messages.IWANTTOSPEAK],
          [messages.TIMETABLE, messages.INFORMATION],
          [messages.GIVEIDEA, messages.ASKQUESTION],
        ],
      },
      resize_keyboard: true,
    })
  })

  this.bot.on('text', (ctx) => {
    console.log(ctx)
    // Using context shortcut
    ctx.telegram.sendMessage(ctx.chat.id, "ХМХМ", {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Тест', callback_data: 'dasda'}]
        ]
      }

    })
  })


  this.bot.launch();
}
}

const telegramBot = new TelegramBot();
module.exports = telegramBot;
