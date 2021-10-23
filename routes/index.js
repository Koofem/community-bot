const { Telegraf } = require('telegraf')
// const Mongodb = require('./mongodb')
const fs = require('fs')
require('dotenv')
const SUGGESTNEWS = "Предложить новость/статью 📰";
const IWANTTOSPEAK = "Я бы хотел выступить🎙";
const TIMETABLE = "Я хочу узнать расписание🗓";
const INFORMATION = "Я хочу узнать о комьюнити🧡";
const GIVEIDEA = "У меня есть предложение/идея для развития комьюнити💡"
const ASKQUESTION = "Я хочу задать вопрос ❓"
const BACK = "Назад ⏪"
const bot = new Telegraf(process.env.BOT_TOKEN)

// Mongodb.init().then(()=> {})

bot.start((ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, "Чем я могу помочь?", {
    reply_markup: {
      keyboard: [
          [SUGGESTNEWS],
          [IWANTTOSPEAK],
          [TIMETABLE],
          [INFORMATION],
          [GIVEIDEA],
          [ASKQUESTION],
      ],
      selective: true
    }
  })
})

bot.command('restart', (ctx)=> {
  ctx.telegram.sendMessage(ctx.chat.id, "Чем я могу помочь?", {
    reply_markup: {
      keyboard: [
        [SUGGESTNEWS],
        [IWANTTOSPEAK],
        [TIMETABLE],
        [INFORMATION],
        [GIVEIDEA],
        [ASKQUESTION],
      ],
    }
  })
})
bot.hears(TIMETABLE, (ctx) => {
  const link = '<a href="https://juvenile-sailboat-95a.notion.site/f4f58fecffe4486c92649de506483d4b">ссылке</a>'
  ctx.telegram.sendMessage(ctx.chat.id, 'Супер, за нашим расписанием можно следить по '+ link, {
    parse_mode:'HTML'
  })
})

bot.hears(INFORMATION, (ctx) => {
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

// bot.on('text', (ctx) => {
//   console.log(ctx)
//   // Using context shortcut
//   ctx.telegram.sendMessage(ctx.chat.id, "ХМХМ", {
//     reply_markup: {
//       inline_keyboard: [
//         [{text: 'Тест', callback_data: 'dasda'}]
//       ]
//     }
//
//   })
// })
bot.launch();
