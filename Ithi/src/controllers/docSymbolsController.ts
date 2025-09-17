import * as vscode from 'vscode';

export class Symbols {
  fileType: string | undefined;
  fileName: string | undefined;

  constructor() {
    this.fileName = undefined;
    this.fileType = undefined;
  }

  getAllNames(
    data: vscode.DocumentSymbol[],
    namesSet = new Set<string>()
  ): Set<string> {
    // Iterate over each object in the symbols array
    for (const item of data) {
      // Add the current object's name to the Set
      namesSet.add(item.name);

      // If the object has a 'children' array, make a recursive call
      if (item.children && item.children.length > 0) {
        this.getAllNames(item.children, namesSet);
      }
    }
    return namesSet;
  }

  async getDocumentSymbols() {
    /* this object represents the currently focused text editor 
    in the VS Code window. */
    const activeEditor: vscode.TextEditor | undefined =
      vscode.window.activeTextEditor;

    if (!activeEditor) {
      // no active text editor found
      return;
    }

    this.fileType = activeEditor.document.languageId;
    if (this.fileType !== 'typescript' && this.fileType !== 'javascript') {
      console.error(`unsupported file type: ${this.fileType}`);
      return;
    }

    this.fileName = activeEditor.document.fileName.split('/').pop();

    /* this is the file's Uniform Resource Identifier (Uri), 
     which specifies the location of the document to be analyzed */
    const uri: vscode.Uri = activeEditor.document.uri;

    /* executeCommand is the core function for executing a command in VS Code. 
    See Docs: https://code.visualstudio.com/api/extension-guides/command#programmatically-executing-a-command */
    const symbols: vscode.DocumentSymbol[] | undefined =
      await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        uri
      );

    if (symbols) {
      /* the DocumentSymbol provides a hierarchical view of symbols 
      within a single file with detailed range information. */
      const uniqueNamesSet: Set<string> = this.getAllNames(symbols);
      const uniqueNamesArray: string[] = [...uniqueNamesSet];

      // console.log('Active File Symbols', uniqueNamesArray);
      return uniqueNamesArray;
    } else {
      console.error(
        'No symbols found in the active document or language server not available.'
      );
    }
  }
}
