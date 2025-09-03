import OpenAI from "openai";
import 'dotenv/config';
import hardGlossary from '../../glossaries/javascript.hard.json';
import { readFileSync } from 'fs';
import * as path from 'path';

export function createHardSet(varKeywords: any){
  const HARD: string[] = [...hardGlossary.javascript, ...varKeywords];
  const hardSet = new Set(HARD);
  return hardSet;
}

//we will use this later when connecting with the other controllers
export function extractCommentObj(astCommentArray: Comment[], hardSet: any){
  const result = [];
  for(let comment of astCommentArray){
    const commentObj = {type: comment.type, text: comment.value, contextNearByLines: comment.nearByLines, matchedKeywords: hardSet.filter((k) => comment.value.includes(k))};
    result.push(commentObj);
  }
  console.log(result);
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

const PROMPT_PATH = path.join(__dirname, '..', '..', 'prompts', 'mask.prompt.txt');

function buildMessages(raw: Comment[], hardSet: string[]) {
  const MASK_PROMPT = readFileSync(PROMPT_PATH, 'utf8');

  const user = {
    task: "mask",
    protected_identifiers: hardSet,
    commentArray: raw,
  };

  return [
    { role: "system", content: MASK_PROMPT },
    { role: "user", content: JSON.stringify(user) },
  ] as OpenAI.ChatCompletionMessageParam[];
}