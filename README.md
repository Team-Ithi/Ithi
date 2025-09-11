![ithi_logo](./images/logo128px.png)

# Ithi - VS Code Extension

![Github Contributors](https://img.shields.io/github/contributors/Team-Ithi/Ithi) ![Github StarGazers](https://img.shields.io/github/stars/Team-Ithi/Ithi) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TODO: add version and extension download images

## Overview

**Ithi** is an AI-powered VS Code IDE extension designed to translate comments into a target language while preserving code integrity.

## Installation

1. Open VS Code.
1. Go to the Extensions view (`command+shift+x`).
1. Search for "Ithi".
1. Click **Install**.

## Extension Settings

Go to `>Preferences: Open User Settings under Extensions > Ithi` and enter the following:

1. **Target Language** - choose the language you want the comments translated to
1. **OpenAI API Key** - You can find your existing key _or_ create a new one in the [API Keys](https://platform.openai.com/api-keys) section on OpenAI's website.
1. **Translation Engine (Optional)** By default, Ithi uses the **Bing** Translation engine. For a more thorough and context-informed translation, you can elect to use **Google Cloud** Translation engine by entering your:
   - `PRIVATE_KEY`
   - `CLIENT_EMAIL`
   - `PROJECT_ID`

TODO: add instructions for gcloud settings

## Usage

> **_NOTE:_** the Ithi extension will not run unless an active text editor is open

1. Open a (javascript or typescipt) file in VS Code
1. Run Ithi in the Command Palette `>Ithi Translate`
1. A notification will communicate that the translation is in progress
1. The Ithi webview panel will populate in the second VS Code column once translation is complete

TODO: insert tutorial images/video/or gif

## Features

- **Source Language Auto-Detection**: detect the language of the comments in the source file.
- **Target Language Selection**: Allow the user to choose a language (163 options) to translate the comments to.
- **Programming Language Support**: JavaScript/TypeScript is the most used programming language globally.
- **Webview Panel UI**: Displays data in a a modularized panel webview
- **Adaptive Theme Integration**: The extension seamlessly integrates with the user's preferred VS Code color theme

## Product Description

Code comments often contain the most critical contextual information for learning, collaboration, and long-term maintainability, yet they remain locked in a single language.

In enterprise settings, where large engineering teams are distributed across regions, the inability to make technical documentation and comments multilingual slows onboarding, increases miscommunication, and can even create compliance risks when important clarifications are inaccessible to all contributors.

## Technologies Used

### Core Technologies

- **VS Code Extension API** - For extension development and VS Code integration
- **React 19** - Frontend framework for the webview interface
- **TailWind CSS**
- **TypeScript/JavaScript** - Primary development languages
- **D3.js** - For component tree visualization and dendrograms
- **Vite** - Module bundling for both extension and webview

TODO - confirm vite is being used

### Development Tools

-**YeoMan** -

- **Babel** - JavaScript/TypeScript compilation and React preprocessing
- **ESLint** - Code quality and style checking
- **Open AI** -
- **Google Cloud API** -
- **Bing Translate API** -
- **Mocha** - Testing framework

TODO - confirm Mocha is being used

## Development Team

| Name          | Role              | GitHub                                             | Email                      |
| ------------- | ----------------- | -------------------------------------------------- | -------------------------- |
| Aaron Chen    | Software Engineer | [@AaronChen11](https://github.com/AaronChen11)     | chenxiyue7@gmail.com       |
| Disney Harley | Software Engineer | [@harleydi](https://github.com/harleydi)           | disneyharleytech@gmail.com |
| Lisa Louison  | Software Engineer | [@llouison](https://github.com/llouison)           | lloudevs@gmail.com         |
| Michael Zhao  | Software Engineer | [@muqingzhao526](https://github.com/muqingzhao526) | muqingzhao526@gmail.com    |
| Yuan Liu      | Software Engineer | [@yuan-cloud](https://github.com/yuan-cloud)       | Eucapop@gmail.com          |

## Release Notes

To view a chronologically ordered list of notable changes to Ithi, take a look at the [Changelog](./comment-translator/CHANGELOG.md).

## Known Issues

For a list of identified and documented issues _or_ to open a new issue you've encountered, visit the [Issues](https://github.com/Team-Ithi/Ithi/issues) tab.

## Contributing to Ithi

We love your input! Ithi is an open-source project, and we welcome contributors of all skill levels.

TODO: update dev instrutions

### Dev Installation Instructions

1. cd into `comment-translator > webview-ui` directory
2. run `npm install`
3. run `npm run build`
4. cd into `comment-translator` directory
5. run `npm install`
6. Note: ensure `package.json > engines.vscode` is accurate. This specifies the minimum version of VS Code API that the extension depends on.
7. add env variables `PRIVATE_KEY`, `CLIENT_EMAIL`, and `PROJECT_ID` to .env file for `gCloudController.ts` to work
8. run `npm run compile`

### Debugging Instructions

1. Open the `src > extension.ts` file.
2. `Run > Start Debugging` or `fn + f5` will open an 'Extension Development Host' VS Code window
3. Create a new JS file and paste in the contents of the test JS file located at: `TODO:add path`
4. In the command palette (`command + shift + p`)run the activation command, currently it's `>Hello World`
   - console logs will be displayed in the original window's DEBUG CONSOLE
