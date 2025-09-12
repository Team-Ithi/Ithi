import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import * as fs from 'fs';
import { Symbols } from './controllers/docSymbolsController';
import { astParseTraverse } from './controllers/astController';
// import { translateText } from './controllers/gCloudController';
import { Bing } from './controllers/bingController';

import {
  createHardSet,
  extractCommentObj,
  OpenAIMask,
} from './controllers/maskAIController';

import{unmaskLines} from './controllers/unmaskController';
// import { arrOfStr, mockCommentData } from './mockTranslateTest';

// This method is called when the extension is activated - the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('The "Ithi" extension is now active!');

  /* registerCommand provides the implementation of the command defined in package.json 
   the commandId parameter must match the command field in package.json */
  const webviewPanel = vscode.commands.registerCommand(
    'ithi.translate',
    async () => {
      // The code you place here will be executed every time your command is executed
      vscode.window.showInformationMessage(`Ithi: Translation Loading...`);

      /* ---- BEGIN BACK-END LOGIC ---- */
      //retrieving file name and symbols
      const symbols = new Symbols();
      const symbolInfo = await symbols.getDocumentSymbols();
      const fileName = symbols.fileName;
      const fileType = symbols.fileType;
      //retreiving file comments
      const commentsObj = astParseTraverse();
      // console.log('commentsObj', commentsObj);
      const copyOfCommentsObj = [...commentsObj];
      //creating mask keys
      const HARD = createHardSet(symbolInfo);
      // console.log("Hard",HARD);
      const extractCommentsObj = extractCommentObj(copyOfCommentsObj, HARD);
      //masking comments
      const { lines, map } = await OpenAIMask(extractCommentsObj, HARD);
      console.log('masked comment obj', lines);
      console.log('map object', map);
      // bing: retrieving source language and translations
      const targetLanguage = 'es'; // TODO: retreive target language from user settings
      const bing = new Bing();
      const translatedProtectedComments = await bing.translateComments(
        lines,
        null,
        targetLanguage
      );
      const sourceLanguage = bing.sourceLang;
      /*
      // gCloud: retrieving source language and translations

      const translatedProtectedComments = await translateText(
        lines,
        targetLanguage
      );
      */

      //re-adding protected words to final translation
      const unmaskedTranslations = unmaskLines(
        translatedProtectedComments,
        map
      );
      // console.log('unmasked translations', unmaskedTranslations);
      //formatting commentData for front-end
      const n = Math.min(
        extractCommentsObj.length,
        unmaskedTranslations.length
      );
      const commentData = new Array(n).fill(null).map((_, i) => {
        const src = extractCommentsObj[i];
        return {
          startLine:
            src.loc?.start?.line ??
            src.contextNearByLines?.[0]?.lineIndex ??
            null,
          endLine:
            src.loc?.end?.line ??
            src.contextNearByLines?.[src.contextNearByLines.length - 1]
              ?.lineIndex ??
            null,
          original: String(src.text.trim() ?? ''),
          translation: String(unmaskedTranslations[i] ?? ''),
        };
      });
      /* ---- END BACK-END LOGIC ---- */

      vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
        'ithiPanel', //This is the ID of the panel
        `Ithi: ${fileName}`, //This is the title of the panel
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
          fileName: fileName,
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
): string {
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
