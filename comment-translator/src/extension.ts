// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Symbols } from './controllers/docSymbolsController';
import { translateText } from './controllers/gCloudController';
import { translation } from './controllers/gTranslateController';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('The "Ithi" extension is now active!');

  const symbols = new Symbols();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const webviewTab = vscode.commands.registerCommand(
    'ithi.helloWorld',
    async () => {
      // The code you place here will be executed every time your command is executed
      const symbolInfo = await symbols.getDocumentSymbols();
      // const translateTest = await translateText('你好吗', 'en')
      const freeTranslateTest = translation('你好吗', 'en')
      vscode.window.showInformationMessage(`Check the DEBUG CONSOLE for logs`);

      const panel = vscode.window.createWebviewPanel(
        'ithiPanel', //this is the id
        'Ithi Translate', //title of the tab
        { viewColumn: vscode.ViewColumn.One }, //editor column to show the new webview panel in
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media'),
          ],
        } //these are the webview options
      );

      //this connects the styles
      const cssStyle = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'vscode.css')
      );

      //this connects the script
      const scriptPath = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'script.js')
      );

      //ignoring type error of parameters because these will be removed
      panel.webview.html = getWebviewContent(cssStyle, scriptPath, symbolInfo);

      panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'alert':
            vscode.window.showInformationMessage(message.text);
            return;
        }
      });
    }
  );

  context.subscriptions.push(webviewTab);
}

function getWebviewContent(
  cssStyle: vscode.Uri,
  scripts: vscode.Uri,
  symbolArr: string[]
): string {
  return `<!DOCTYPE html> 
				  <html lang="en">
					  <head>
					  <link rel="stylesheet" type="text/css" href="${cssStyle}" />
							<title>Ithi</title>
							<script src="${scripts}"></script>
						  <script>
							  const vscode = acquireVsCodeApi();
							  document.addEventListener('DOMContentLoaded', function(){
								  const p1 = document.getElementById('p1');
								  p1.style.color = 'cornflowerblue';
							  })
						  </script>
						</head>
					  <body>
						  <h1 id="title-h1">This is Ithi</h1>
						  <p>No translations yet! Click <span id="p1">Translate</span> to get started.</p>
						  <div class="form">
            				<code>Original Comment: (FR)</code>
            				<input />
            				<code>Translation: (EN)</code>
            				<textarea></textarea>
						  <button onclick="vscode.postMessage({command: 'alert', text: 'Hello from the webview'});">
						  	Translate
						</button>
						<button onclick="changeHeading()">
						  	Change Heading
						</button>
						<p><a>Read the docs</a> to learn more about Ithi.</p>
            <h2>docSymbolsController.ts</h2>
            <p>The active symbols in this file are:</p>
            <p>[${symbolArr}]</p>
					  </body>
				  </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
