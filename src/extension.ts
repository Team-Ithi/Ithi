import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import * as fs from 'fs';
import { Symbols } from './controllers/docSymbolsController';
import { astParseTraverse } from './controllers/astController';
import { translateText } from './controllers/gCloudController';
import { Bing } from './controllers/bingController';

import {
  createHardSet,
  extractCommentObj,
  OpenAIMask,
} from './controllers/maskAIController';

import { unmaskLines } from './controllers/unmaskController';
// import { arrOfStr, mockCommentData } from './mockTranslateTest';

// This method is called when the extension is activated - the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('The "Ithi" extension is now active!');

  // this will be used to display errors to the user
  const outputChannel = vscode.window.createOutputChannel('Ithi');

  /* registerCommand provides the implementation of the command defined in package.json 
   the commandId parameter must match the command field in package.json */
  const webviewPanel = vscode.commands.registerCommand(
    'ithi.translate',
    async () => {
      const config = await vscode.workspace.getConfiguration('ithi');

      /* ---- BEGIN BACK-END LOGIC ---- */
      //retrieving file name and symbols
      const symbols = new Symbols();
      const symbolInfo = await symbols.getDocumentSymbols();
      if (!symbolInfo) {
        outputChannel.appendLine(
          '[Ithi - ERROR]: No symbols found in the active document or unsupported file type.'
        );
        outputChannel.show(true);
        return;
      }
      // this message will only show when valid doc symbols are detected
      vscode.window.showInformationMessage(`Ithi: Translation Loading...`);

      const fileName = symbols.fileName;
      const fileType = symbols.fileType;
      //retreiving file comments
      const commentsObj = astParseTraverse() as any[];
      // console.log('commentsObj', commentsObj);
      const copyOfCommentsObj = [...commentsObj];

      //creating mask keys
      const HARD = createHardSet(symbolInfo);
      const extractCommentsObj = extractCommentObj(copyOfCommentsObj, HARD);
      //masking comments
      const { lines, map } = await OpenAIMask(extractCommentsObj, HARD);
      // console.log('masked comment obj', lines);
      // console.log('map object', map);

      const targetLanguage: string = (await config.get(
        'targetLanguage'
      )) as string;
      const userTranslatorChoice = await config.get('translator');

      let translatedProtectedComments: string[] | undefined = [];
      // bing/gCloud: retrieving source language and translations
      let sourceLanguage: string | undefined;

      if (userTranslatorChoice === 'Google Cloud') {
        const results = await translateText(lines, targetLanguage);
        translatedProtectedComments = results?.map((el) => el?.translation);
        sourceLanguage = results[0]?.sourceLanguage;
      } else {
        const bing = new Bing();
        translatedProtectedComments = await bing.translateComments(
          lines,
          null,
          targetLanguage
        );
        sourceLanguage = bing.sourceLang;
      }

      // console.log('translatedProtectedComments', translatedProtectedComments);
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

      // vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
        'ithiPanel', //This is the ID of the panel
        `Ithi: ${fileName} (${targetLanguage})`, //This is the title of the panel
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

  //let htmlContent = '';

  try {
    let htmlContent = fs.readFileSync(indexPath.fsPath, 'utf8'); //interpret the file's binary data as a human-readable UTF-8 encoded string
    // If Vite emitted absolute paths like "/assets/...", make them relative: "assets/..."
    htmlContent = htmlContent.replace(/(src|href)="\//g, '$1="');
    /* Webviews in VS Code are essentially isolated iframes that run inside the editor. 
    For security reasons, webviews cannot directly access local resources on the user's file system 
    using standard file:// URIs. The asWebviewUri method acts as a bridge, transforming the local 
    path into a special URI format that the VS Code renderer understands and can securely resolve.  */
    // Convert local URIs to webview-safe URIs and prepare a per-panel nonce
    const baseUri = panelWebview.asWebviewUri(webviewUriDist);
    const nonce = getNonce();
    // Tight CSP: allow only this webview origin for resources; allow scripts that have our nonce
    const cspMeta = `
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        img-src ${panelWebview.cspSource} https:;
        script-src 'nonce-${nonce}';
        style-src ${panelWebview.cspSource};
        font-src ${panelWebview.cspSource};
        connect-src ${panelWebview.cspSource} https:;
        frame-src ${panelWebview.cspSource};
      ">
    `
      .replace(/\s{2,}/g, ' ')
      .trim();
    // Add baseUri and the VS Code webview API script
    // Inject <base> (so relative asset URLs resolve) and CSP <meta> at the top of <head>
    htmlContent = htmlContent.replace(
      '<head>',
      `<head><base href="${baseUri}/">${cspMeta}`
    );
    // Add nonce to every <script> tag that doesn't already have one (covers inline and module scripts)
    htmlContent = htmlContent.replace(
      /<script\b(?![^>]*\bnonce=)/g,
      `<script nonce="${nonce}"`
    );
    return htmlContent;
  } catch (error) {
    console.error('Error reading index.html:', error);
    return `
        <html>
          <body>
            <h1>Error Loading Webview</h1>
            <p>Could not load the React app. Make sure to run 'npm run build' in the webview-ui directory.</p>
          <pre>${String(error)}</pre>
          </body>
        </html>
      `;
  }
}
function getNonce(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length: 32 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
// This method is called when your extension is deactivated.
export function deactivate() {}
