type MaskKind =
  | "code"
  | "url"
  | "path"
  | "email"
  | "uuid"
  | "placeholder"
  | "task"
  | "identifier";

interface MaskEntry {
  token: string;
  original: string;
  kind: MaskKind;
}

/**
 * Replace all token occurrences in a single string with their originals.
 * Sort by token length to prevent partial-overlap issues like:
 * __ITHI_CODE_0001__ vs __ITHI_CODE_0001__X
 * and to avoid accidental re-replacements when tokens share prefixes.
 */

function unmaskOne(text: string, map: MaskEntry[]): string {
  const sorted = [...map].sort((a, b) => b.token.length - a.token.length);
  let out = text;
  for (const e of sorted) {
    // Escape token for safe use in a global regex (tokens contain underscores, digits, etc.)
    const pattern = new RegExp(e.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(pattern, e.original);
  }
  return out;
}

// Vectorized unmasking for an array of masked lines.
// Each entry is processed independently
export function unmaskLines(lines: string[], map: MaskEntry[]): string[] {
  return lines.map(line => unmaskOne(line, map));
}