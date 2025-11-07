import { bot } from "../bot.js";

function createMathCaptcha() {
  const captchaStore = new Map();

  function generate() {
    const operations = ["+", "-", "*"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, correctAnswer;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 10) + 5;
        num2 = Math.floor(Math.random() * 5) + 1;
        correctAnswer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        correctAnswer = num1 * num2;
        break;
    }

    const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const question = `${num1} ${operation} ${num2} = ?`;
    const answers = generateAnswers(correctAnswer);

    captchaStore.set(id, {
      correctAnswer,
      expiresAt: Date.now() + 5 * 60 * 1000,
      answers,
    });

    return { id, question, answers };
  }

  function generateAnswers(correctAnswer) {
    const answers = [{ id: 1, value: correctAnswer, correct: true }];

    let wrongAnswer1, wrongAnswer2;

    do {
      wrongAnswer1 =
        correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    } while (wrongAnswer1 === correctAnswer || wrongAnswer1 < 0);

    do {
      wrongAnswer2 =
        correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    } while (wrongAnswer2 === correctAnswer || wrongAnswer2 === wrongAnswer1 || wrongAnswer2 < 0);

    answers.push({ id: 2, value: wrongAnswer1, correct: false });
    answers.push({ id: 3, value: wrongAnswer2, correct: false });

    return shuffleArray(answers);
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function verify(captchaId, userAnswerValue) {
    const captcha = captchaStore.get(captchaId);

    if (!captcha) return { success: false, message: "Капча не найдена" };
    if (Date.now() > captcha.expiresAt) {
      captchaStore.delete(captchaId);
      return { success: false, message: "Капча устарела" };
    }

    const parsed = Number(userAnswerValue);
    if (Number.isNaN(parsed)) return { success: false, message: "Неверный формат ответа" };

    const selected = captcha.answers.find((a) => a.value === parsed);
    if (!selected) return { success: false, message: "Ответ не найден" };

    const isCorrect = selected.correct;
    captchaStore.delete(captchaId);

    return { success: isCorrect, message: isCorrect ? "Верно!" : "Неверный ответ", correctAnswer: captcha.correctAnswer };
  }

  return { generate, verify };
}


const mathCaptcha = createMathCaptcha();
const pending = new Map();
const CAPTCHA_TTL_MS = 5 * 60 * 1000;

export default function antibot(active, chatId) {
  
  if (active==="False") return Promise.resolve(true);

  return new Promise((resolve) => {
    try {
      const captcha = mathCaptcha.generate();

      // очистка старого pending для этого чата (если есть)
      const prev = pending.get(chatId);
      if (prev) {
        clearTimeout(prev.timeoutId);
        // разрешаем предыдущий промис как false — устарел
        try { prev.resolve(false); } catch {}
        pending.delete(chatId);
      }

      const timeoutId = setTimeout(() => {
        const entry = pending.get(chatId);
        if (entry && entry.captchaId === captcha.id) {
          try { bot.sendMessage(chatId, "❌ Капча устарела. Запросите новую."); } catch {}
          try { entry.resolve(false); } catch {}
          pending.delete(chatId);
        }
      }, CAPTCHA_TTL_MS);

      pending.set(chatId, { captchaId: captcha.id, resolve, timeoutId });

      // отправляем кнопки с включённым id капчи в callback_data
      const keyboard = captcha.answers.map((a) => [{ text: a.value.toString(), callback_data: `antibot_${captcha.id}_${a.value}` }]);

      try {
        bot.sendMessage(chatId, `🤖 *Проверка на робота*\nПривет! Прежде чем продолжить, давай убедимся, что ты человек :)\nРеши простой пример: <span class="tg-spoiler">${captcha.question}</span>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
      } catch (sendErr) {
        console.error("antibot send error:", sendErr);
        clearTimeout(timeoutId);
        pending.delete(chatId);
        resolve(false);
      }
    } catch (err) {
      console.error("antibot generate error:", err);
      resolve(false);
    }
  });
}

bot.on("callback_query", async (query) => {
  const { data, message, id: queryId } = query;
  if (!data || !message) return;

  if (!data.startsWith("antibot_")) {
    // не наша капча
    return;
  }

  // формат antibot_<captchaId>_<value>
  const parts = data.split("_");
  if (parts.length < 3) {
    try { await bot.answerCallbackQuery(queryId, { text: "Неверные данные капчи." }); } catch {}
    return;
  }

  const [, captchaId, ...valueParts] = parts;
  const value = valueParts.join("_");
  const chatId = message.chat.id;
  const entry = pending.get(chatId);

  // попытка удалить сообщение с кнопками
  try { await bot.deleteMessage(chatId, message.message_id); } catch (e) {}

  if (!entry || entry.captchaId !== captchaId) {
    try { await bot.sendMessage(chatId, "❌ Капча устарела или не найдена. Запросите новую."); } catch {}
    if (entry) {
      try { entry.resolve(false); } catch {}
      clearTimeout(entry.timeoutId);
      pending.delete(chatId);
    }
    return;
  }

  try {
    const result = mathCaptcha.verify(captchaId, value);
    clearTimeout(entry.timeoutId);
    pending.delete(chatId);

    if (result.success) {
      try { await bot.sendMessage(chatId, "✅ Капча пройдена успешно!"); } catch {}
      try { entry.resolve(true); } catch {}
    } else {
      try { await bot.sendMessage(chatId, `❌ ${result.message}`); } catch {}
      try { entry.resolve(false); } catch {}
    }
  } catch (error) {
    console.error("Ошибка при проверке капчи:", error);
    if (entry) {
      try { entry.resolve(false); } catch {}
      clearTimeout(entry.timeoutId);
      pending.delete(chatId);
    }
  }
});