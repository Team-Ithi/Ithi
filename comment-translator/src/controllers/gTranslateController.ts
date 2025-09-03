// const translate = require('google-translate-api')
import { translate } from '@vitalets/google-translate-api'
import { HttpsProxyAgent } from 'https-proxy-agent';


const proxies = [
  "http://198.199.86.11",
  "http://32.223.6.94",
  "http://64.92.82.61",
  "http://20.81.66.55",
  "http://50.122.86.118",
  "http://77.110.114.116"
]

const getRandomProxy = () => {
  const proxy = proxies[Math.floor(Math.random() * proxies.length)]
  return new HttpsProxyAgent(proxy)
}


export const translation = async (text: any, language: string) => {
  try {
    if (Array.isArray(text)) {
      const result = await Promise.all(
        text.map(async (item) => {
          const input = typeof item === "string" ? item : item.text;
          const res = await translate(input, { to: language, fetchOptions: { agent: getRandomProxy() } });
          return res.raw;
        })
      );

      console.log("Original:", text, "Translated:", result);
      return { original: text, translated: result };
    } else {
      const input = typeof text === "string" ? text : text.text;
      const res = await translate(input, { to: language, fetchOptions: { agent: getRandomProxy() } });
      console.log("Original:", text, "Translated:", res.text);
      return { original: text, translated: res.text };
    }
  } catch (err) {
    console.error("Translation Failed:", err);
    throw err;
  }
};
