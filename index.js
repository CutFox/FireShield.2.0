import "dotenv/config";
import { bot } from "./vless_shop/bot/bot.js";
import antibot from "./vless_shop/bot/module/antibot.js";
import { xUiAxios } from "./vless_shop/3х-ui/api.js";
import { cryptionLink } from "./vless_shop/happ/api.js";
import "./vless_shop/server/server.js"


bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  const captcha = await antibot(process.env.CAPTCHA_MODE, chatId);
  if (captcha) {
    bot.sendMessage(chatId, "good");

    //  console.log(await cryptionLink("https://prosubaru.life:2096/s/c87642nzz0jrwsq3"));
    // const server = {
    //   ssl: true,
    //   address: "prosubaru.life",
    //   port: 51235,
    //   webbasepath: "jGtnqgxVJFxnAV4SXv",
    // };
    // const serverData = { username: "ZSGn09IH98", password: "WJtcQFT6Xm" };
    // console.log("first", (await xUiAxios(server, serverData, "login")).data);
    // bot.sendMessage(
    //   chatId,
    //   (await xUiAxios(server, serverData, "NewX25519Cert")).data.obj.publicKey
    // );
    bot.sendMessage(
      chatId,
      (await cryptionLink("https://prosubaru.life:2096/s/c87642nzz0jrwsq3"))
    );
  }
  return;
});
