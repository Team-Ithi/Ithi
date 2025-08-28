# Ithi

An IDE extension that translates comments into a target language while preserving code integrity.

## Dev Installation Instructions

1. cd into `comment-translator` directory
2. run `npm install`
3. Note: ensure `package.json > engines.vscode` is accurate. This specifies the minimum version of VS Code API that the extension depends on.
4. run `npm run compile`

## Debugging Instructions

1. Open the `src > extension.ts` file.
2. `Run > Start Debugging` or `fn + f5` will open an 'Extension Development Host' VS Code window
3. Create a new JS file and paste in the contents of the test JS file located at: `TODO:add path`
4. In the command palette (`command + shift + p`)run the activation command, currently it's `>Hello World`
   - console logs will be displayed in the original window's DEBUG CONSOLE
