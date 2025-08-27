import * as vscode from 'vscode';

export class Symbols {
  async getDocumentSymbols() {
    console.log('in symbol controller');
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      console.log('no active editor');
      return;
    }
    console.log('active editor exists!');

    const uri = activeEditor.document.uri;
    const symbols = await vscode.commands.executeCommand<
      vscode.SymbolInformation[] | vscode.DocumentSymbol[]
    >('vscode.executeDocumentSymbolProvider', uri);

    if (symbols) {
      console.log('Symbols in active document:', symbols);
      // Process the symbols as needed
    } else {
      console.log(
        'No symbols found in the active document or language server not available.'
      );
    }
  }
}
