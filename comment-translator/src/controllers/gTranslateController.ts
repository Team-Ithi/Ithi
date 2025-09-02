// const translate = require('google-translate-api')
import { translate } from '@vitalets/google-translate-api'


export const translation = async (text: any, language: string) => {
  try {
    if (Array.isArray(text)) {
      const result = await Promise.all(
        text.map(async (item) => {
          const input = typeof item === "string" ? item : item.text;
          const res = await translate(input, { to: language });
          return res.text;
        })
      );

      console.log("Original:", text, "Translated:", result);
      return { original: text, translated: result };
    } else {
      const input = typeof text === "string" ? text : text.text;
      const res = await translate(input, { to: language });
      console.log("Original:", text, "Translated:", res.text);
      return { original: text, translated: res.text };
    }
  } catch (err) {
    console.error("Translation Failed:", err);
    throw err;
  }
};
