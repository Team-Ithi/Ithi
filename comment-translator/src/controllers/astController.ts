import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { error } from 'node:console';
import type * as t from '@babel/types';


type FunctionInfo = { name: string; params: any; loc?: t.SourceLocation | null };
type VariableInfo = { name: string; type?: any; loc?: t.SourceLocation | null };
type ClassInfo = { name: string; superClass?: string; loc?: t.SourceLocation | null };
type NearByLine = { lineIndex: number; text: string };
type AugmentedComment = (t.CommentBlock | t.CommentLine) & {
  nearByLines?: NearByLine[];
  matchedKeywords?: string[];
};

export const astParseTraverse = () => {
  const editor = vscode.window.activeTextEditor;
  //TODO: resolve typescript errors
  const fileType = editor!.document.languageId;
  if (fileType !== 'typescript' && fileType !== 'javascript') {
    //TODO: update to throw errors
    console.log(`unsupported file type: ${fileType}`);
  }
  const code = editor!.document.getText();
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
  } as any);
  if (!ast) {
    console.log('parsing failed');
    return error;
  }
  //console.log(ast);

  //traverse
  const functions: FunctionInfo[] = [];
  const variables: VariableInfo[] = [];
  const classes: ClassInfo[] = [];
  traverse(ast, {
    FunctionDeclaration(path) {
      const n = path.node;
      //console.log(n)
      functions.push({
        name: (n.id as t.Identifier | null)!.name,
        params: (n.params as any).type,
        loc: n.loc,
      });
    },

    VariableDeclarator(path) {
      const n = path.node;
      variables.push({
        name: (n.id as any).name,
        type: n.id.type,
        loc: n.loc,
      });
    },

    ClassDeclaration(path) {
      const n = path.node;
      classes.push({
        name: (n.id as t.Identifier | null)!.name,
        superClass: (n.superClass as any)?.name,
        loc: n.loc,
      });
    },
  });

  //split file by lines and store each line in an array
  const lines = code.split(/\n/);
  //console.log(lines);

  let keywordVal: string[] = [];
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
  //console.log(keywordVal);
  for (const i of (ast.comments! as AugmentedComment[])) {
    const lineLength = i.value.split(/\n/).length;
    const startLine = i.loc!.start.line;
    let endLine = i.loc!.end.line;
    if (i.type === 'CommentBlock') {
      endLine = startLine + lineLength - 1;
    }
    const lineBeforeIndex = Math.max(1, startLine - 1);
    const lineAfterIndex = Math.min(lines.length, endLine + 1);

    const nearByLines: NearByLine[] = [];
    for (let j = lineBeforeIndex; j <= lineAfterIndex; j++) {
      nearByLines.push({ lineIndex: j, text: lines[j - 1] });
    }
    (i as AugmentedComment).nearByLines = nearByLines;
    (i as AugmentedComment).matchedKeywords = keywordVal.filter((k) => i.value.includes(k));
  }
  return ast.comments;
};
