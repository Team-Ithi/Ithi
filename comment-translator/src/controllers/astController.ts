import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { error } from 'node:console';

export const astParseTraverse = () => {
  const editor = vscode.window.activeTextEditor;
  const fileType = editor.document.languageId;
  if (fileType !== 'typescript' && fileType !== 'javascript') {
    console.log(`unsupported file type: ${fileType}`);
  }
  const code = editor.document.getText();
  if (!code) {
    console.log('invalid file');
  }

  //parse
  const ast = parse(code, {
    sourceType: 'unambiguous',
    comments: true,
    tokens: true,
    ranges: true,
    plugins: ['jsx', 'typescript'],
  });
  if (!ast) {
    console.log('parsing failed');
    return error;
  }
  console.log(ast);

  //traverse
  const functions = [];
  const variables = [];
  const classes = [];
  traverse(ast, {
    FunctionDeclaration(path) {
      const n = path.node;
      //console.log(n)
      functions.push({
        name: n.id.name,
        params: n.params.type,
        loc: n.loc,
      });
    },

    VariableDeclarator(path) {
      const n = path.node;
      variables.push({
        name: n.id.name,
        type: n.id.type,
        loc: n.loc,
      });
    },

    ClassDeclaration(path) {
      const n = path.node;
      classes.push({
        name: n.id.name,
        superClass: n.superClass.name,
        loc: n.loc,
      });
    },
  });

  //split file by lines and store each line in an array
  const lines = code.split(/\n/);
  //console.log(lines);

  let keywordVal = [];
  for (let i of functions) {
    //console.log(i.value);
    keywordVal.push(i.name);
  }
  for (let i of variables) {
    //console.log(i.value);
    keywordVal.push(i.name);
  }
  for (let i of classes) {
    //console.log(i.value);
    keywordVal.push(i.name);
  }
  console.log(keywordVal);
  for (let i of ast.comments) {
    const lineLength = i.value.split(/\n/).length;
    const startLine = i.loc.start.line;
    let endLine = i.loc.end.line;
    if (i.type === 'CommentBlock') {
      endLine = startLine + lineLength - 1;
    }
    const lineBeforeIndex = Math.max(1, startLine - 1);
    const lineAfterIndex = Math.min(lines.length, endLine + 1);

    const nearByLines = [];
    for (let j = lineBeforeIndex; j <= lineAfterIndex; j++) {
      nearByLines.push({ lineIndex: j, text: lines[j - 1] });
    }
    i.nearByLines = nearByLines;
    i.matchedKeywords = keywordVal.filter((k) => i.value.includes(k));
  }
  return ast.comments;
};
