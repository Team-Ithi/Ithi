import * as vscode from 'vscode';

export class Symbols {
  getAllNames(data: vscode.DocumentSymbol[], namesSet = new Set()) {
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
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
      console.log('no active editor');
      return;
    }

    const fileType = activeEditor.document.languageId;
    if (fileType !== 'typescript' && fileType !== 'javascript') {
      console.log(`unsupported file type: ${fileType}`);
    }
    console.log('fileType:', fileType);

    const uri = activeEditor.document.uri;

    /* This is the core function for executing a command in VS Code. 
      It takes two main arguments: 
      'vscode.executeDocumentSymbolProvider': The unique identifier of the command to be executed. 
      This specific command runs the document symbol provider for a given file.
      uri: The second argument is the file's Uniform Resource Identifier (Uri), 
      which specifies the location of the document to be analyzed. */
    const symbols = await vscode.commands.executeCommand<
      vscode.DocumentSymbol[]
    >('vscode.executeDocumentSymbolProvider', uri);

    if (symbols) {
      /* the DocumentSymbol provides a hierarchical view of symbols 
      within a single file with detailed range information. */
      console.log('Symbols in active document:', symbols);

      const uniqueNamesSet = this.getAllNames(symbols);
      const uniqueNamesArray = [...uniqueNamesSet];

      console.log('active symbol names:', uniqueNamesArray);
      return uniqueNamesArray;
    } else {
      //TODO: update console logs to throw errors
      console.log(
        'No symbols found in the active document or language server not available.'
      );
    }
  }
}
