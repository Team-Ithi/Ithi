import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as vscode from 'vscode';
import { error } from 'node:console';
import type * as t from '@babel/types';

//Parses the active VS Code editor text with Babel and traverses the AST to collect high-level symbols (functions, variables, classes).
type FunctionInfo = { name: string; params: any; loc?: t.SourceLocation | null };
type VariableInfo = { name: string; type?: any; loc?: t.SourceLocation | null };
type ClassInfo = { name: string; superClass?: string; loc?: t.SourceLocation | null };
//nearByLines: small window of source lines around the comment
type NearByLine = { lineIndex: number; text: string };
//matchedKeywords: any collected identifiers mentioned in the comment
type AugmentedComment = (t.CommentBlock | t.CommentLine) & {
  nearByLines?: NearByLine[];
  matchedKeywords?: string[];
};

export const astParseTraverse = () => {
  //Read current editor text. Bail early if empty.
  const editor = vscode.window.activeTextEditor;
  const code = editor!.document.getText();
  if (!code) {
    console.error('invalid file');
    return error;
  }

  //Parse source with Babel
  const ast = parse(code, {
    sourceType: 'unambiguous',
    comments: true,
    tokens: true,
    ranges: true,
    plugins: ['jsx', 'typescript'],
  } as any);
  if (!ast) {
    console.error('parsing failed');
    return error;
  }
  //console.log(ast);

  //Traverse AST and collect FunctionDeclaration, VariableDeclarator, ClassDeclaration
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

  //Split the file into lines for later context windows.
  const lines = code.split(/\n/);
  //Build a flat list of identifier keywords from the collected symbols.
  let keywordVal: string[] = [];
  for (let i of functions) {
    keywordVal.push(i.name);
  }
  for (let i of variables) {
    keywordVal.push(i.name);
  }
  for (let i of classes) {
    keywordVal.push(i.name);
  }
  //For each AST comment, take a small window of surrounding lines and store as nearByLines, Set matchedKeywords to any keywords that appear in the comment text.
  for (const i of (ast.comments! as AugmentedComment[])) {
    //Compute [startLine, endLine] using i.loc
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
    //`matchedKeywords` = keywords that appear in comment text
    (i as AugmentedComment).nearByLines = nearByLines;
    (i as AugmentedComment).matchedKeywords = keywordVal.filter((k) => i.value.includes(k));
  }
  //Return ast.comments (now augmented with nearByLines and matchedKeywords).
  return ast.comments;
};
