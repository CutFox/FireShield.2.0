import "dotenv/config";
import { bot } from "./vless_shop/bot/bot.js";
import antibot from "./vless_shop/bot/module/antibot.js";
import { xUiAxios } from "./vless_shop/3х-ui/api.js";

bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  const captcha = await antibot(process.env.CAPTCHA_MODE, chatId);
  if (captcha) {
    bot.sendMessage(chatId, "good");
    const server = {
      ssl: true,
      address: "fireshield.network",
      port: 7649,
      webbasepath: "ieKaNamtH2I1i3qWOL",
    };
    const serverData = { username: "9eHDo2KLoX", password: "D8BKqg4FBK" };
    console.log("first", (await xUiAxios(server, serverData, "login")).data);
    console.log("first", await xUiAxios(server, serverData, "NewX25519Cert"));
    bot.sendMessage(
      chatId,
      (await xUiAxios(server, serverData, "NewX25519Cert")).data.obj.publicKey
    );
  }
  return;
});
