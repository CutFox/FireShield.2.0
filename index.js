import "dotenv/config";
import {bot} from "./vless_shop/bot/bot.js"
import antibot from "./vless_shop/bot/module/antibot.js"
import { xUiAxios } from "./vless_shop/3х-ui/api.js";

bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  const captcha = await antibot(process.env.CAPTCHA_MODE, chatId);
  if (captcha) {
    bot.sendMessage(chatId, 'good');
    const server = { ssl: true, address: "fireshield.network", port: 7649, webbasepath:"ieKaNamtH2I1i3qWOL", };
    const serverData = {username:"9eHDo2KLoX",password:"D8BKqg4FBK"}
    xUiAxios(server,serverData, "login" )
    xUiAxios(server,serverData, "NewX25519Cert" )
  }return
});


