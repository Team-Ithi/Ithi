export const arrOfStr = [
  '你好世界 <45219>, 你好世界 <99384>.',
  '你好世界 <60725>, 你好世界 <11803>.',
  '你好世界 <82914>, 你好世界 <43007>.',
];
export const arrOfObj = [
  {
    line: 'Line One',
    text: '你好世界 <45219>, 你好世界 <99384>.',
  },
  {
    line: 'Line Two',
    text: '你好世界 <60725>, 你好世界 <11803>.',
  },
  {
    line: 'Line Three',
    text: '你好世界 <82914>, 你好世界 <43007>.',
  },
];
export const commentData = [
  {
    startLine: '1',
    endLine: '1',
    original: "The module 'vscode' contains the VS Code extensibility API",
    translation: "Le module 'vscode' contient l'API d'extensibilité de VS Code",
  },
  {
    startLine: '5',
    endLine: '5',
    original:
      "import { translateText } from './controllers/gCloudController'; // not using paid version of gtranslate",
    translation:
      "import { translateText } from './controllers/gCloudController'; // ne pas utiliser la version payante de gtranslate",
  },
  {
    startLine: '9',
    endLine: '9',
    original:
      'This method is called when the extension is activated - the very first time the command is executed',
    translation:
      "Cette méthode est appelée lorsque l'extension est activée - la toute première fois que la commande est exécutée",
  },
  {
    startLine: '13',
    endLine: '14',
    original:
      'registerCommand provides the implementation of the command defined in package.json \n   the commandId parameter must match the command field in package.json',
    translation:
      "registerCommand fournit l'implémentation de la commande définie dans package.json \n le paramètre commandId doit correspondre au champ de commande dans package.json",
  },
  {
    startLine: '18',
    endLine: '18',
    original: '---- BEGIN BACK-END LOGIC ---- ',
    translation: '---- DÉBUT DE LA LOGIQUE BACK-END ----',
  },
  {
    startLine: '19',
    endLine: '19',
    original:
      'The code you place here will be executed every time your command is executed',
    translation:
      'Le code que vous placez ici sera exécuté à chaque fois que votre commande sera exécutée',
  },
  {
    startLine: '21',
    endLine: '21',
    original: 'retrieving file symbols',
    translation: 'récupération des symboles de fichiers',
  },
  {
    startLine: '22',
    endLine: '22',
    original: 'retreiving file comments',
    translation: 'récupérer les commentaires des fichiers',
  },
  {
    startLine: '23',
    endLine: '23',
    original:
      'const maskedComments = maskController.maskComments(symbolInfo, commentsObj) //masking protected symbols/key words in comments',
    translation:
      'const maskedComments = maskController.maskComments(symbolInfo, commentsObj) //masquage des symboles/mots clés protégés dans les commentaires',
  },
  {
    startLine: '25',
    endLine: '25',
    original: "const translateTest = await translateText(arrOfObj, 'en')",
    translation: "const translateTest = await translateText(arrOfObj, 'en')",
  },
  {
    startLine: '26',
    endLine: '26',
    original: 'TODO: retrieve source language from front-end (after MVP)',
    translation: 'TODO: récupérer la langue source du front-end (après MVP)',
  },
  {
    startLine: '27',
    endLine: '27',
    original: 'TODO: retreive target language from front-end (after MVP)',
    translation:
      'TODO: récupérer la langue cible depuis le front-end (après MVP)',
  },
  {
    startLine: '28',
    endLine: '28',
    original: 'TODO: get source language from gTranslate',
    translation: 'TODO: obtenir la langue source à partir de gTranslate',
  },
  {
    startLine: '29',
    endLine: '34',
    original:
      "const translatedProtectedComments = await translation(arrOfStr,targetLanguage); //get translations console.log('translatedProtectedComments', translatedProtectedComments);const unmaskedTranslationsObj = maskController.unmaskComments(translatedProtectedComments); //re-adding protected words to final translation",
    translation:
      "const translatedProtectedComments = await translation(arrOfStr,targetLanguage); // Récupérer les traductions console.log('translatedProtectedComments', translatedProtectedComments);const unmaskedTranslationsObj = maskController.unmaskComments(translatedProtectedComments); // Réajouter les mots protégés à la traduction finale",
  },
  {
    startLine: '35',
    endLine: '35',
    original: ' ---- END BACK-END LOGIC ---- ',
    translation: '---- FIN DE LA LOGIQUE BACK-END ----',
  },
  {
    startLine: '40',
    endLine: '40',
    original: 'This is the ID of the panel',
    translation: "Ceci est l'ID du panneau",
  },
  {
    startLine: '41',
    endLine: '41',
    original: 'This is the title of the panel',
    translation: "C'est le titre du panel",
  },
  {
    startLine: '42',
    endLine: '42',
    original:
      'This defines which editor column the new webviewPanel will be shown in',
    translation:
      "Ceci définit dans quelle colonne de l'éditeur le nouveau panneau de visualisation Web sera affiché",
  },
  {
    startLine: '45',
    endLine: '45',
    original:
      'TODO: getState and setState have much lower performance overhead than retainContextWhenHidden',
    translation:
      'TODO : getState et setState ont une surcharge de performances bien inférieure à celle de retainContextWhenHidden',
  },
  {
    startLine: '47',
    endLine: '47',
    original: "Allow access to the 'webview-ui' folder within the extension",
    translation: "Autoriser l'accès au dossier 'webview-ui' dans l'extension",
  },
  {
    startLine: '49',
    endLine: '49',
    original: 'these are the webview options',
    translation: "ce sont les options d'affichage Web",
  },
  {
    startLine: '57',
    endLine: '57',
    original:
      "the postMessage method is used to send data from the extension's backend to a webview panel frontend",
    translation:
      "la méthode postMessage est utilisée pour envoyer des données du backend de l'extension vers un frontend de panneau WebView",
  },
  {
    startLine: '58',
    endLine: '58',
    original: 'TODO: translate all content in webview',
    translation: 'TODO : traduire tout le contenu de la vue Web',
  },
  {
    startLine: '68',
    endLine: '68',
    original: 'onDidReceiveMessage handles messages from the webview frontend',
    translation: "onDidReceiveMessage gère les messages de l'interface Webview",
  },
  {
    startLine: '95',
    endLine: '95',
    original:
      "interpret the file's binary data as a human-readable UTF-8 encoded string",
    translation:
      "interpréter les données binaires du fichier comme une chaîne codée en UTF-8 lisible par l'homme",
  },
  {
    startLine: '96',
    endLine: '99',
    original:
      "Webviews in VS Code are essentially isolated iframes that run inside the editor. For security reasons, webviews cannot directly access local resources on the user's file system using standard file:// URIs. The asWebviewUri method acts as a bridge, transforming the local path into a special URI format that the VS Code renderer understands and can securely resolve.",
    translation:
      "Les vues Web dans VS Code sont essentiellement des iframes isolées qui s'exécutent dans l'éditeur. Pour des raisons de sécurité, les vues Web ne peuvent pas accéder directement aux ressources locales du système de fichiers de l'utilisateur à l'aide des URI file:// standard. La méthode asWebviewUri agit comme un pont, transformant le chemin local en un format d'URI spécifique que le moteur de rendu VS Code comprend et peut résoudre en toute sécurité.",
  },
  {
    startLine: '102',
    endLine: '102',
    original:
      'If Vite emitted absolute paths like "/assets/...", make them relative: "assets/..."',
    translation:
      'Si Vite émet des chemins absolus comme "/assets/...", rendez-les relatifs : "assets/..."',
  },
  {
    startLine: '105',
    endLine: '105',
    original: 'TODO: Inject CSP at the top of <head>',
    translation: 'TODO: injecter CSP en haut de <head>',
  },
  {
    startLine: '106',
    endLine: '106',
    original: 'Add baseUri and the VS Code webview API script',
    translation: 'Ajoutez baseUri et le script API Webview VS Code',
  },
  {
    startLine: '112',
    endLine: '112',
    original:
      "TODO: Add nonce to every <script> tag that doesn't already have one",
    translation:
      "TODO: ajouter un nonce à chaque balise <script> qui n'en possède pas déjà un",
  },
  {
    startLine: '129',
    endLine: '129',
    original: 'This method is called when your extension is deactivated',
    translation:
      'Cette méthode est appelée lorsque votre extension est désactivée',
  },
];
