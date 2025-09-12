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

function unmaskOne(text: string, map: MaskEntry[]): string {
  const sorted = [...map].sort((a, b) => b.token.length - a.token.length);
  let out = text;
  for (const e of sorted) {
    const pattern = new RegExp(e.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(pattern, e.original);
  }
  return out;
}

export function unmaskLines(lines: string[], map: MaskEntry[]): string[] {
  return lines.map(line => unmaskOne(line, map));
}