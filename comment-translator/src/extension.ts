import * as vscode from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import { Symbols } from './controllers/docSymbolsController';
import { translateText } from './controllers/gCloudController';
import { translation } from './controllers/gTranslateController';
import { arrOfStr, arrOfObj } from './mockTranslateTest';
import { astParseTraverse } from './controllers/astController';
import * as fs from 'fs';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('The "Ithi" extension is now active!');

  const symbols = new Symbols();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const webviewPanel = vscode.commands.registerCommand(
    'ithi.helloWorld',
    async () => {
      // The code you place here will be executed every time your command is executed
      const commentsObj = astParseTraverse();
      console.log('commentsObj', commentsObj);
      const symbolInfo = await symbols.getDocumentSymbols();

      // const translateTest = await translateText(arrOfObj, 'en')
      const freeTranslateTest = translation(arrOfStr, 'en') // doesnt keep the masked i think

      vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel = vscode.window.createWebviewPanel(
        'ithiPanel', // id of the panel
        'Ithi Translate', // title of the panel
        { viewColumn: vscode.ViewColumn.Two }, // editor column to show the new webview panel in
        {
          enableScripts: true,
          retainContextWhenHidden: true, //TODO: getState and setState have much lower performance overhead than retainContextWhenHidden
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'webview-ui'), // Allow access to the 'webview-ui' folder within the extension
          ],
        } //these are the webview options
      );

      panel.webview.html = getHtmlForWebview(
        panel.webview,
        context.extensionUri
      );

      //method used to send data from the extension's backend to a webview panel frontend
      panel.webview.postMessage({
        type: 'translationData',
        value: {
          symbols: symbolInfo,
          original: 'this is a test',
          translation: 'esta es una prueba',
          lines: '18-21',
        },
      });

      // Handle messages from the webview
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
