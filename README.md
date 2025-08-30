# Ithi

An IDE extension that translates comments into a target language while preserving code integrity.

## Dev Installation Instructions

1. cd into `comment-translator > webview-ui` directory
2. run `npm install`
3. run `npm run build`
4. cd into `comment-translator` directory
5. run `npm install`
6. Note: ensure `package.json > engines.vscode` is accurate. This specifies the minimum version of VS Code API that the extension depends on.
7. add env variables `PRIVATE_KEY`, `CLIENT_EMAIL`, and `PROJECT_ID` to .env file for `gCloudController.ts` to work
8. run `npm run compile`

## Debugging Instructions

1. Open the `src > extension.ts` file.
2. `Run > Start Debugging` or `fn + f5` will open an 'Extension Development Host' VS Code window
3. Create a new JS file and paste in the contents of the test JS file located at: `TODO:add path`
4. In the command palette (`command + shift + p`)run the activation command, currently it's `>Hello World`
   - console logs will be displayed in the original window's DEBUG CONSOLE

# Ithi README

This is the README for your extension "Ithi". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
