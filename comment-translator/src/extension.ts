import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import * as fs from 'fs';
import { Symbols } from './controllers/docSymbolsController';
import { astParseTraverse } from './controllers/astController';
// import { translateText } from './controllers/gCloudController'; // not using paid version of gtranslate
// import { translation } from './controllers/gTranslateController';
// import { arrOfStr, arrOfObj } from './mockTranslateTest';

// This method is called when the extension is activated - the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('The "Ithi" extension is now active!');

  /* registerCommand provides the implementation of the command defined in package.json 
   the commandId parameter must match the command field in package.json */
  const webviewPanel = vscode.commands.registerCommand(
    'ithi.translate',
    async () => {
      /* ---- BEGIN BACK-END LOGIC ---- */
      // The code you place here will be executed every time your command is executed
      const symbols = new Symbols();
      const symbolInfo = await symbols.getDocumentSymbols(); //retrieving file symbols
      const commentsObj = astParseTraverse(); //retreiving file comments
      // const maskedComments = maskController.maskComments(symbolInfo, commentsObj) //masking protected symbols/key words in comments
      console.log('commentsObj', commentsObj);
      // const translateTest = await translateText(arrOfObj, 'en')
      const sourceLanguage = 'en'; // TODO: retreive source language from front-end (after MVP)
      const targetLanguage = 'fr'; // TODO: retreive target language from front-end (after MVP)
      //TODO: get source language from gTranslate
      // const translatedProtectedComments = await translation(
      //   arrOfStr,
      //   targetLanguage
      // ); //get translations
      // const unmaskedTranslationsObj = maskController.unmaskComments(translatedProtectedComments) //re-adding protected words to final translation
      /* ---- END BACK-END LOGIC ---- */

      vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel = vscode.window.createWebviewPanel(
        'ithiPanel', //This is the ID of the panel
        'Ithi Translate', //This is the title of the panel
        { viewColumn: vscode.ViewColumn.Two }, //This defines which editor column the new webview panel will be shown in
        {
          enableScripts: true,
          retainContextWhenHidden: true, //TODO: getState and setState have much lower performance overhead than retainContextWhenHidden
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'webview-ui'), //Allow access to the 'webview-ui' folder within the extension
          ],
        } //these are the webview options
      );

      panel.webview.html = getHtmlForWebview(
        panel.webview,
        context.extensionUri
      );

      // the postMessage method is used to send data from the extension's backend to a webview panel frontend
      panel.webview.postMessage({
        type: 'translationData',
        value: {
          source: sourceLanguage,
          target: targetLanguage,
          commentData: [
            {
              startLine: '1',
              endLine: '3',
              original:
                'The code you place here will be executed every time your command is executed',
              translation:
                'El código que coloques aquí se ejecutará cada vez que se ejecute tu comando',
            },
            {
              startLine: '18',
              endLine: '21',
              original:
                'The code you place here will be executed every time your command is executed',
              translation: '每次執行命令時，都會執行您在此處放置的程式碼',
            },
            {
              startLine: '35',
              endLine: '37',
              original:
                'The code you place here will be executed every time your command is executed',
              translation:
                'Le code que vous placez ici sera exécuté à chaque fois que votre commande sera exécutée',
            },
          ],
        },
      });

      // onDidReceiveMessage handles messages from the webview frontend
      panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'dataReceived':
            vscode.window.showInformationMessage(message.text);
            break;
          case 'alert':
            vscode.window.showInformationMessage(message.text);
            return;
        }
      });
    }
  );

  context.subscriptions.push(webviewPanel);
}

function getHtmlForWebview(
  panelWebview: vscode.WebviewPanel['webview'],
  passContext: vscode.Uri
) {
  const webviewUriDist = vscode.Uri.joinPath(passContext, 'webview-ui', 'dist');
  const indexPath = vscode.Uri.joinPath(webviewUriDist, 'index.html');

  let htmlContent = '';

  try {
    htmlContent = fs.readFileSync(indexPath.fsPath, 'utf8'); //interpret the file's binary data as a human-readable UTF-8 encoded string
    const baseUri = panelWebview.asWebviewUri(webviewUriDist); //TODO: comment here

    // If Vite emitted absolute paths like "/assets/...", make them relative: "assets/..."
    htmlContent = htmlContent.replace(/(src|href)="\//g, '$1="');

    //TODO: Inject CSP at the top of <head>
    // Add baseUri and the VS Code webview API script
    htmlContent = htmlContent.replace(
      '<head>',
      `<head><base href="${baseUri}/">`
    );

    //TODO: Add nonce to every <script> tag that doesn't already have one

    return htmlContent;
  } catch (error) {
    console.error('Error reading index.html:', error);
    return `
        <html>
          <body>
            <h1>Error Loading Webview</h1>
            <p>Could not load the React app. Make sure to run 'npm run build' in the webview-ui directory.</p>
            <p>Error: ${error}</p>
          </body>
        </html>
      `;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
