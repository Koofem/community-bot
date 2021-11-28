require('dotenv').config()
const fs = require("fs");
const telegramBot = require('Class/TelegramBot');

const { mongodb } = require('Models/MongoBD/index');
const UserBD = require('Models/MongoBD/UserBD');
const SpeechBD = require('Models/MongoBD/SpeechBD');
const IdeasBD = require('Models/MongoBD/IdeasBD')
const QuestionsBD = require("Models/MongoBD/QuestionsBD");
const PostBD = require("Models/MongoBD/PostBD")

const Notion = require('Models/notion');

const BotApp = new (class BotApp {
  constructor() {
  }
  async init() {
    await mongodb.init();
    const promises = [
    await UserBD.init(),
    await QuestionsBD.init(),
    await IdeasBD.init(),
    await SpeechBD.init(),
    await PostBD.init(),
    ]
    await Promise.all(promises).then(()=> {
      console.log('Модули базы подключены')
    })
    await Notion.init();
    await telegramBot.init();
  }

})();

BotApp.init();

