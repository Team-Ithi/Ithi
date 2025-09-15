import { Translate } from '@google-cloud/translate/build/src/v2';
import * as vscode from 'vscode';

export const translateText = async (text: any, target: string) => {
  try {
    // Pulling the users input from the settings to get required information and keys for the api to work
    const config = await vscode.workspace.getConfiguration('ithi');
    const projectId: string | undefined = await config.get(
      'googleCloudConfiguration.projectId'
    );
    const client_email: string | undefined = await config.get(
      'googleCloudConfiguration.clientEmail'
    );
    const private_key: string | undefined = await config.get(
      'googleCloudConfiguration.privateKey'
    );

    const translate = new Translate({
      // Initiating a new translation project
      projectId,
      credentials: {
        client_email: client_email,
        private_key: (private_key || '').replace(/\\n/g, '\n'),
      },
    });

    if (Array.isArray(text)) {
      // Checking if information is in the form of an array
      const result = await Promise.all(
        // Iterating over ALL elements in that array and creating a promise
        text.map(async (str) => {
          if (typeof str === 'string') {
            // Checking if the array is just an ArrOfStrings
            const [translation] = await translate.translate(str, target);
            const [detection] = await translate.detect(str);
            return { translation, sourceLanguage: detection.language };
          } else if (typeof str === 'object' && 'text' in str) {
            // Checking if array is an ArrOfObjects
            const [translation] = await translate.translate(str.text, target);
            const [detection] = await translate.detect(str.text);
            return { translation, sourceLanguage: detection.language };
          }
        })
      );

      console.log('Original:', text, 'Translated:', result);
      return result;
    }
  } catch (err) {
    throw new Error(`Translation Failed: ${err}`);
  }
};
