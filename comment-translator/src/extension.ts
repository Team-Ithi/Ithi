// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Symbols } from './controllers/docSymbolsController';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ithi" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const symbols = new Symbols();

  const disposable = vscode.commands.registerCommand(
    'ithi.helloWorld',
    async () => {
      // The code you place here will be executed every time your command is executed
      const symbolInfo = await symbols.getDocumentSymbols();

      vscode.window.showInformationMessage(`Symbol info is: ${symbolInfo}`);
    }
  );

  /* To view the webview panel:
  	1. comment lines 18-26
	2. add '* + /' at the end of #3 (line 31)
	3. run npm run compile in the terminal
  const disposable = vscode.commands.registerCommand('ithi.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    vscode.window.showInformationMessage('Hello World from ithi!');
    const panel = vscode.window.createWebviewPanel(
      'ithiPanel', //this is the id
      'Ithi Translate', //title of the tab
      vscode.ViewColumn.One, //editor column to show the new webview panel in
      { enableScripts: true } //webview options
    );
    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'alert':
          vscode.window.showInformationMessage(message.text);
          return;
      }
    });
  });
  /* end webview code */

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
  return `<!DOCTYPE html> 
				  <html lang="en">
					  <head>
							<title>Ithi</title>
						  <script>
							  const vscode = acquireVsCodeApi();
							  document.addEventListener('DOMContentLoaded', function(){
								  const p1 = document.getElementById('p1');
								  p1.style.color = 'green';
							  })
						  </script>
						</head>
					  <body>
						  <h1 id="title-h1">Testing</h1>
						  <p id="p1">Ithi Extension Open</p>
						  <input type="button" onclick="vscode.postMessage({command: 'alert', text: 'Hello from the webview'});" />
					  </body>
				  </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
