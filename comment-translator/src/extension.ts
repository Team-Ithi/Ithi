import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import * as fs from 'fs';
import { Symbols } from './controllers/docSymbolsController';
import { astParseTraverse } from './controllers/astController';
// import { translateText } from './controllers/gCloudController'; // not using paid version of gtranslate
import { translation } from './controllers/gTranslateController';
import { createHardSet, extractCommentObj, aiMask } from './controllers/maskController'
import { arrOfStr, arrOfObj, commentData } from './mockTranslateTest';

// This method is called when the extension is activated - the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('The "Ithi" extension is now active!');

  /* registerCommand provides the implementation of the command defined in package.json 
   the commandId parameter must match the command field in package.json */
  const webviewPanel = vscode.commands.registerCommand(
    'ithi.translate',
    async () => {
      vscode.window.showInformationMessage(`Ithi: Beginning translation...`);
      /* ---- BEGIN BACK-END LOGIC ---- */
      // The code you place here will be executed every time your command is executed
      const symbols = new Symbols();
      const symbolInfo = await symbols.getDocumentSymbols(); //retrieving file symbols
      const commentsObj = astParseTraverse(); //retreiving file comments
      const HARD = createHardSet(symbolInfo);
      const extractCommentsObj = extractCommentObj(commentsObj, HARD);
      const { lines, map } = await aiMask(extractCommentsObj, HARD)
      // const maskedComments = maskController.maskComments(symbolInfo, commentsObj) //masking protected symbols/key words in comments
      console.log('commentsObj', commentsObj);
      console.log(HARD);
      console.log('masked comment obj', lines);
      console.log('map object', map)
      // const translateTest = await translateText(arr
      console.log('commentsObj', commentsObj);
      // const translateTest = await translateText(arrOfObj, 'en')
      const sourceLanguage = 'en'; // TODO: retreive source language from front-end (after MVP)
      const targetLanguage = 'fr'; // TODO: retreive target language from front-end (after MVP)
      //TODO: get source language from gTranslate
      const translatedProtectedComments = await translation(
        arrOfStr,
        targetLanguage
      ); //get translations
      //console.log('translatedProtectedComments', translatedProtectedComments);
      //const unmaskedTranslationsObj = maskController.unmaskComments(translatedProtectedComments); //re-adding protected words to final translation 
      /* ---- END BACK-END LOGIC ---- */

      vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel = vscode.window.createWebviewPanel(
        'ithiPanel', //This is the ID of the panel
        'Ithi Translate', //This is the title of the panel
        { viewColumn: vscode.ViewColumn.Two }, //This defines which editor column the new webviewPanel will be shown in
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
      //TODO: translate all content in webview
      panel.webview.postMessage({
        type: 'translationData',
        value: {
          source: sourceLanguage,
          target: targetLanguage,
          commentData: commentData,
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
    /* Webviews in VS Code are essentially isolated iframes that run inside the editor. 
    For security reasons, webviews cannot directly access local resources on the user's file system 
    using standard file:// URIs. The asWebviewUri method acts as a bridge, transforming the local 
    path into a special URI format that the VS Code renderer understands and can securely resolve.  */
    const baseUri = panelWebview.asWebviewUri(webviewUriDist);

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
