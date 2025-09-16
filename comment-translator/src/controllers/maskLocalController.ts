/**
 * This code is not being used in the extension,
 * it is our beginning attempt at the below issue:
 * Open Issue: https://github.com/Team-Ithi/Ithi/issues/49
 */

export type CommentType = 'CommentLine' | 'CommentBlock';

export interface CommentContextLine {
  lineIndex: number;
  text: string;
}

export interface Comment {
  type: CommentType;
  text: string;
  contextNearByLines?: CommentContextLine[];
  matchedKeywords?: string[];
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

// utilities

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// reserved token ranges in a line so we don't mask inside tokens
const TOKEN_RE = /__ITHI_[A-Z]+_\d{4}__/g;
function findTokenRanges(line: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line))) {
    ranges.push({ start: m.index, end: m.index + m[0].length });
  }
  return ranges;
}

function overlaps(
  a: { start: number; end: number },
  b: { start: number; end: number }
) {
  return !(a.end <= b.start || a.start >= b.end);
}

// A + B whole-line test (language-agnostic signals)

function isCodeLike(line: string): boolean {
  const startsDecl =
    /^\s*(import|export|const|let|var|class|function|return|new|await|async|interface|type|enum|yield)\b/.test(
      line
    );
  const hasFrom = /\bfrom\s+['"][^'"]+['"]\s*;?/.test(line);
  const looksCall = /^\s*[A-Za-z_$][A-Za-z0-9_$]*\s*\(.*\)/.test(line);
  const endsSemiOrAssign = /;\s*$|=|=>|:=/.test(line);
  const punctCount = (line.match(/[{}()\[\];<>:=/*\-+.,|&!?`'"]/g) || [])
    .length;

  // NEW: shell-ish comment lines
  const shellish =
    /^\s*#/.test(line) &&
    (/\[[^\]]+\]/.test(line) || /\b(if|then|fi|elif|esac)\b/.test(line));

  return (
    startsDecl ||
    hasFrom ||
    looksCall ||
    endsSemiOrAssign ||
    punctCount >= 2 ||
    shellish
  );
}

function containsProtectedWord(
  line: string,
  protectedOrSoft: Set<string>
): boolean {
  // consider "identifier-like" tokens only (safer than raw \b with unicode)
  const words = line.match(/[A-Za-z_][A-Za-z0-9_$.]*/g) || [];
  return words.some((w) => protectedOrSoft.has(w));
}

type Hit = { start: number; end: number; kind: MaskKind; text: string };

function collectSpanHits(line: string, protectedHard: Set<string>): Hit[] {
  const hits: Hit[] = [];
  const reserved = findTokenRanges(line);

  function addRegex(re: RegExp, kind: MaskKind) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const h = {
        start: m.index,
        end: m.index + m[0].length,
        kind,
        text: m[0],
      };
      if (!reserved.some((r) => overlaps(h, r))) hits.push(h);
    }
  }

  // 1) inline code (fenced blocks are handled at comment level)
  addRegex(/`[^`]*`/g, 'code');

  // 2) non-linguistic spans
  addRegex(/\bhttps?:\/\/[^\s)]+/g, 'url');
  addRegex(/(?:\.\.?\/|[A-Za-z]:\\)[^\s)]+/g, 'path');
  addRegex(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'email');
  addRegex(
    /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
    'uuid'
  );
  addRegex(
    /(\{[^}]+\}|\$\{[^}]+\}|%[0-9]+\$[a-zA-Z]|{[0-9]+})/g,
    'placeholder'
  );
  addRegex(/(['"])([A-Za-z0-9_.-]+)\1/g, 'identifier');
  addRegex(/\b(TODO|FIXME|HACK|NOTE)\b:?\s?/g, 'task');

  // 3) identifiers
  const idRe = /\b[A-Za-z_][A-Za-z0-9_$.]*\b/g;
  const commonKeywords = new Set([
    // treat as "soft": don't mask in prose unless they're in HARD list
    'if',
    'else',
    'switch',
    'case',
    'default',
    'for',
    'while',
    'do',
    'return',
    'break',
    'continue',
    'new',
    'const',
    'let',
    'var',
    'function',
    'class',
    'type',
    'enum',
    'interface',
    'await',
    'async',
    'yield',
    'try',
    'catch',
    'finally',
    'throw',
  ]);

  let m: RegExpExecArray | null;
  idRe.lastIndex = 0;
  while ((m = idRe.exec(line))) {
    const word = m[0];
    // Only mask "hard" protected identifiers here.
    // (Soft keywords like "if"/"else"/"switch" remain as prose unless inside code-like contexts,
    // which are already captured by whole-line CODE or inline backticks.)
    if (protectedHard.has(word)) {
      hits.push({
        start: m.index,
        end: m.index + word.length,
        kind: 'identifier',
        text: word,
      });
      continue;
    }
    // Otherwise: heuristic "identifier-shaped" leftovers (camelCase, PascalCase, snake, dotted)
    const looksIdentifier =
      /[A-Z]/.test(word[0]) ||
      /_/.test(word) ||
      /\./.test(word) ||
      /[a-z][A-Z]/.test(word);
    if (looksIdentifier && !commonKeywords.has(word)) {
      hits.push({
        start: m.index,
        end: m.index + word.length,
        kind: 'identifier',
        text: word,
      });
    }
  }

  // precedence: code/url/path/email/uuid/placeholder/task > identifier
  const rank: Record<MaskKind, number> = {
    code: 1,
    url: 1,
    path: 1,
    email: 1,
    uuid: 1,
    placeholder: 1,
    task: 1,
    identifier: 2,
  };

  // Deduplicate overlaps by priority, then by longer span
  hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const out: Hit[] = [];
  for (const h of hits) {
    const ov = out.find((x) => overlaps(x, h));
    if (!ov) {
      out.push(h);
      continue;
    }
    if (rank[h.kind] < rank[ov.kind]) {
      const i = out.indexOf(ov);
      out.splice(i, 1, h);
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

// fenced block masking (comment-level)

const FENCE_PATTERNS = [/```[\s\S]*?```/g, /~~~[\s\S]*?~~~/g];

function maskFencedBlocks(
  text: string,
  nextToken: (kind: MaskKind, original: string) => string
): string {
  // collect all matches first, sort by start index, then replace left->right
  type M = { start: number; end: number; text: string };
  const matches: M[] = [];
  for (const re of FENCE_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    }
  }
  if (!matches.length) return text;
  matches.sort((a, b) => a.start - b.start);

  // collapse overlaps (keep first)
  const collapsed: M[] = [];
  for (const m of matches) {
    if (!collapsed.length || m.start >= collapsed[collapsed.length - 1].end) {
      collapsed.push(m);
    }
  }

  let out = '';
  let cur = 0;
  for (const m of collapsed) {
    out += text.slice(cur, m.start);
    out += nextToken('code', m.text);
    cur = m.end;
  }
  out += text.slice(cur);
  return out;
}

function maskOneLine(
  line: string,
  protectedHard: Set<string>,
  protectedOrSoft: Set<string>,
  nextToken: (kind: MaskKind, original: string) => string,
  inBlock: boolean
): string {
  if (
    isCodeLike(line) &&
    (inBlock || containsProtectedWord(line, protectedOrSoft))
  ) {
    return nextToken('code', line);
  }

  // Otherwise span-level masking
  const hits = collectSpanHits(line, protectedHard);
  if (!hits.length) return line;

  let out = '',
    cur = 0;
  for (const h of hits) {
    out += line.slice(cur, h.start) + nextToken(h.kind, h.text);
    cur = h.end;
  }
  return out + line.slice(cur);
}

const SOFT_KEYWORDS = [
  'if',
  'else',
  'switch',
  'case',
  'default',
  'for',
  'while',
  'do',
  'return',
  'break',
  'continue',
];

function collectSoftKeywordsFrom(text: string): string[] {
  const found = new Set<string>();
  const re = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (SOFT_KEYWORDS.includes(m[0])) {
      found.add(m[0]);
    }
  }
  return [...found];
}

export async function maskLocal(
  raw: Comment[],
  protectedIdentifiers: string[]
): Promise<AIMask> {
  const map: MaskEntry[] = [];
  let counter = 0;

  const nextToken = (kind: MaskKind, original: string) => {
    const token = `__ITHI_${kind.toUpperCase()}_${String(counter).padStart(
      4,
      '0'
    )}__`;
    counter++;
    map.push({ token, original, kind });
    return token;
  };

  const protectedHard = new Set(protectedIdentifiers || []);
  const lines: string[] = [];

  for (const c of raw) {
    const soft = new Set<string>(collectSoftKeywordsFrom(String(c.text ?? '')));
    const protectedOrSoft = new Set<string>([...protectedHard, ...soft]);

    let masked = maskFencedBlocks(String(c.text ?? ''), nextToken);

    const parts = masked.split('\n');
    const inBlock = c.type === 'CommentBlock'; // NEW
    const maskedParts = parts.map(
      (p) => maskOneLine(p, protectedHard, protectedOrSoft, nextToken, inBlock) // NEW arg
    );

    lines.push(maskedParts.join('\n'));
  }

  return { lines, map };
}
