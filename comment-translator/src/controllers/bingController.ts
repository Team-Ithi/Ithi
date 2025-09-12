import { translate } from 'bing-translate-api';

export class Bing {
  sourceLang: string | undefined;

  constructor() {
    this.sourceLang = undefined;
  }

  async translateComments(
    content: string[],
    from: null,
    to: string
  ): Promise<(string | undefined)[]> {
    try {
      // Use .map() to create an array of promises.
      // Each async callback returns a promise for a single translation.
      const translationPromises = content.map(async (commentStr) => {
        if (commentStr.trim() === "") {return "";}
        const translation = await translate(commentStr, from, to);

        // only assign a value is the current value is null or undefined
        this.sourceLang ??= translation?.language?.from;

        if (translation?.translation) {
          return translation.translation;
        }
        return "";
      });

      // wait for all promises to resolve
      const result = await Promise.all(translationPromises);
      return result;
    } catch (err) {
      throw new Error(`Translation Failed: ${err}`);
    }
  }
}
