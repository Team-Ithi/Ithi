import OpenAI from 'openai';
import { readFileSync } from 'fs';
import * as path from 'path';
import hardGlossary from '../glossaries/javascript-hard.json';
import * as vscode from 'vscode';

/**
 * Currently hardcoded with javascript, this function will be used later for stretch.
 * Merge the hard glossary with symbol-derived keywords according to the code langauge.
 * This is the authoritative set of identifiers that must never be translated.
 */

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

// Convert raw AST comments into the shape required by the masking prompt.
export function extractCommentObj(astCommentArray: any, hardSet: any) {
  const result = [];
  for (let comment of astCommentArray) {
    const commentObj = {
      type: comment.type,
      text: comment.value,
      loc: comment.loc,
      //a few lines around the comment for extra signals
      contextNearByLines: comment.nearByLines,
      //subset of HARD that appear in the comment text
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

/**
 * Build the OpenAI message array:
 * System: the deterministic masking prompt (rules + invariants)
 * User: the JSON payload containing the comments and protected set
 */
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


/**
 * Run the masking model and normalize its response.
 * `response_format: { type: 'json_object' }` forces JSON-only output.
 */

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
  
  // Deterministic output: temperature 0, JSON response
  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  // Parse and guard against shape drift
  const content = resp.choices[0]?.message?.content ?? '{}';
  const json = JSON.parse(content);

  const lines: string[] =
    Array.isArray(json.lines) &&
    json.lines.every((x: any) => typeof x === 'string')
      ? json.lines
      : [];

  // Some responses return a single `masked` string
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
