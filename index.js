import "dotenv/config";
import {bot} from "./vless_shop/bot/bot.js"
import antibot from "./vless_shop/bot/module/antibot.js"

bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  const captcha = await antibot(process.env.CAPTCHA_MODE, chatId);
  if (captcha) {
    bot.sendMessage(chatId, 'good');
  }return
});


