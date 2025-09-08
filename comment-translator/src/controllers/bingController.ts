import { translate } from 'bing-translate-api';

export class Bing {
  sourceLang: string | undefined;

  constructor() {
    this.sourceLang = undefined;
  }

  async translateComments(content: string, from: null, to: string) {
    console.log('in bing translate');
    try {
      let res = await translate(content, from, to);
      this.sourceLang = res?.language?.from;

      console.log('the source language is:', this.sourceLang);
      console.log(content, ' is translated to: ', res?.translation);
      console.log(res);

      return res?.translation;
    } catch (err) {
      throw new Error(`Translation Failed: ${err}`);
    }
  }
}
