import OpenAI from 'openai';
import { readFileSync } from 'fs';
import * as path from 'path';
import hardGlossary from '../glossaries/javascript-hard.json';
import * as vscode from 'vscode';

export function createHardSet(varKeywords: unknown) {
  const base = Array.isArray((hardGlossary as any).javascript)
    ? (hardGlossary as any).javascript
    : [];

  const extra = Array.isArray(varKeywords) ? varKeywords : [];

  const HARD: string[] = [...base, ...extra]
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  return [...new Set(HARD)];
}

//we will use this later when connecting with the other controllers
export function extractCommentObj(astCommentArray: any, hardSet: any) {
  const result = [];
  for (let comment of astCommentArray) {
    const commentObj = {
      type: comment.type,
      text: comment.value,
      loc: comment.loc,
      contextNearByLines: comment.nearByLines,
      matchedKeywords: hardSet.filter((k: any) => comment.value.includes(k)),
    };
    result.push(commentObj);
  }
  //console.log(result);
  return result;
}

export type CommentType = 'CommentLine' | 'CommentBlock';

export interface CommentContextLine {
  lineIndex: number;
  text: string;
}

export interface Comment {
  value: any;
  nearByLines: any;
  type: CommentType;
  text: string;
  contextNearByLines: CommentContextLine[];
  matchedKeywords: string[];
}

export type MaskKind =
  | 'code'
  | 'url'
  | 'path'
  | 'email'
  | 'uuid'
  | 'placeholder'
  | 'task'
  | 'identifier';

export interface MaskEntry {
  token: string;
  original: string;
  kind: MaskKind;
}

export interface AIMask {
  lines: string[];
  map: MaskEntry[];
}

const PROMPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'prompts',
  'openAiPrompt.txt'
);

function buildMessages(raw: Comment[], hardSet: string[]) {
  const MASK_PROMPT = readFileSync(PROMPT_PATH, 'utf8');

  const user = {
    task: 'mask',
    protected_identifiers: hardSet,
    commentArray: raw,
  };

  return [
    { role: 'system', content: MASK_PROMPT },
    { role: 'user', content: JSON.stringify(user) },
  ] as OpenAI.ChatCompletionMessageParam[];
}

export async function OpenAIMask(
  rawText: any[],
  protectedIdentifiers: string[],
  model: string = 'gpt-4o-mini'
): Promise<AIMask> {
  const config = await vscode.workspace.getConfiguration('ithi');

  const openAiKey: string | undefined = await config.get('openAiApiKey');

  const client = new OpenAI({ apiKey: openAiKey });
  const messages = buildMessages(rawText, protectedIdentifiers);
  //console.log('running ai masking');

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const content = resp.choices[0]?.message?.content ?? '{}';
  const json = JSON.parse(content);

  const lines: string[] =
    Array.isArray(json.lines) &&
    json.lines.every((x: any) => typeof x === 'string')
      ? json.lines
      : [];

  if (lines.length === 0 && typeof json.masked === 'string') {
    const fallback = String(json.masked);
    const split = fallback.split('\n');
    if (split.length === rawText.length) {
      json.lines = split;
    }
  }
  const map: MaskEntry[] = Array.isArray(json.map) ? json.map : [];

  return { lines: json.lines ?? [], map };
}
