import { Translate } from '@google-cloud/translate/build/src/v2';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import 'dotenv/config';

const translate = new Translate({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
});

export const translateText = async (text: any, target: string) => {
    console.log('gCloud hitting')
    try {
        if (Array.isArray(text)) {
            const result = await Promise.all(
            text.map(async (str) => {
                if (typeof str === "string") {
                const [translation] = await translate.translate(str, target);
                return translation;
                } else if (typeof str === "object" && "text" in str) {
                const [translation] = await translate.translate(str.text, target);
                return translation;
                }
            })
            );

            console.log("Original:", text, "Translated:", result);
            return result;
        }
        // } else {
        //     const [translation] = await translate.translate(text, target);
        //     console.log("Original:", text, "Translated:", translation);
        //     return { original: text, translated: translation };
        // }


        
        
        // console.log('Original: ', text, 'Translated: ', translation)
        // return { original: text, translated: translation }
    } catch (err) {
        throw new Error(
            `Translation Failed: ${err}`
        )
    }
}

