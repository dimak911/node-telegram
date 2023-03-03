const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;

const production = process.env.NODE_ENV;

console.log(production);

const bot = new TelegramApi(token, production ? {} : { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Now I will think of a number from 0 to 9 and you have to guess it!"
  );
  const randomNumber = Math.floor(Math.random() * 10).toString();
  chats[chatId] = randomNumber;

  await bot.sendMessage(chatId, "Guess number!", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Welcome message" },
    { command: "/info", description: "Get user first name and last name" },
    { command: "/game", description: "Guess number from 0 to 9" },
  ]);

  if (production) {
    console.log("production if");
    bot.setWebHook(process.env.WEBHOOK_URL);
  }

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/192/7.webp"
      );
      return bot.sendMessage(chatId, "Welcome to my telegram bot");
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Your name is ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, "Unknown command, try something else!");
  });

  bot.on("callback_query", (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === "/again") {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Congratulations, you guess number ${chats[chatId]}`,
        againOptions
      );
    } else {
      return bot.sendMessage(
        chatId,
        `Unfortunately you lose. Bot think number ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
