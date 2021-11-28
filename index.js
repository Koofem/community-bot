require('dotenv').config()
const fs = require("fs");
const telegramBot = require('Class/TelegramBot');
const UserBD = require('Models/MongoBD/UserBD');
const { mongodb } = require('Models/MongoBD/index');
const BotApp = new (class BotApp {
  constructor() {
  }
  async init() {
    await mongodb.init();
    await UserBD.init();
    await telegramBot.init();
  }

})();

BotApp.init();

