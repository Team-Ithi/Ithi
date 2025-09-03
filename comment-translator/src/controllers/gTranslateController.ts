// const translate = require('google-translate-api')
import { translate } from '@vitalets/google-translate-api'
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';


const proxies = [
  "http://198.199.86.11",
  "http://32.223.6.94",
  "http://64.92.82.61",
  "http://20.81.66.55",
  "http://50.122.86.118",
  "http://77.110.114.116"
]

const getRandomProxy = async () => {
  for (let i = 0; i < proxies.length; i++) { // loop to ensure we dont try looking for proxies forever
    const proxy = proxies[Math.floor(Math.random() * proxies.length)]
    try {
      const ip = await testProxy(proxy)
      console.log(`Using proxy ${proxy}, IP seen as ${ip}`)
      return new HttpsProxyAgent(proxy)
    } catch (err) {
      console.error(`Proxy ${proxy} failed`, err.message)
    }
  }

  console.warn("No working proxies available. Falling back to direct connection.") // ensures project doesnt crash in the event all proxies are dead
  return undefined
}

const testProxy = async (proxyUrl: string) => { // This function ensures the proxy is alive and usable
  const controller = new AbortController() // Cancels request if the proxy is too slow
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch("https://api.ipify.org?format=json", { // makes a request that returns ip address being seen by the server
      agent: new HttpsProxyAgent(proxyUrl), // makes sure that the request is being sent via selected proxy
      signal: controller.signal // connect fetch to abort controller
    })

    clearTimeout(timeout) // clears timeout if fetch finishes in time  

    if (!res.ok) {
      throw new Error(`Proxy failed with status: ${res.status}`)
    }

    const data = await res.json() //
    return data.ip // returns parsed ip
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Proxy connection timed out')
    }
    throw err
  }
  
  
}


export const translation = async (text: any, language: string) => {
  try {
    const proxy = await getRandomProxy()
    console.log(proxy)
    if (Array.isArray(text)) {
      const result = await Promise.all(
        text.map(async (item) => {
          const input = typeof item === "string" ? item : item.text;
          const res = await translate(input, { to: language, fetchOptions: proxy ? { agent: proxy } : undefined });
          return { original: text, sourceLanguage: res.raw.src, translated: res.text };
        })
      );

      console.log("Original:", text, "Translated:", result);
      return result;
    } else {
      const input = typeof text === "string" ? text : text.text;
      const res = await translate(input, { to: language, fetchOptions: proxy ? { agent: proxy } : undefined });

      const result = {
        original: input,
        sourceLanguage: res.raw.src,
        translated: res.text
      }
      console.log("Original:", text, "Translated:", res.text);
      return result;
    }
  } catch (err) {
    console.error("Translation Failed:", err);
    throw err;
  }
};
