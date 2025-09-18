/* src/test/mask-unmask.test.ts */
/* eslint-disable @typescript-eslint/no-var-requires */
const { expect } = require('chai');
const mock = require('mock-require');

/** --- Minimal VS Code stub (only what we need) --- */
let currentText = `
// email: alice@example.com
// key: sk-12345
const ssn = "111-22-3333";
function hello(n){ return "hi " + n; }
`;
/* minimal VS Code mock — add workspace.getConfiguration */
mock('vscode', {
  window: {
    activeTextEditor: {
      document: {
        languageId: 'javascript',
        getText: () => currentText,
      },
      edit: async (cb: (eb: any) => void) => {
        const eb = { replace: (_: any, t: string) => { currentText = t; } };
        cb(eb);
        return true;
      },
    },
    showInformationMessage: () => undefined,
    showErrorMessage: () => undefined,
    showWarningMessage: () => undefined,
  },
  workspace: {
    // Many controllers do: workspace.getConfiguration('…').get('keywords', [])
    // We return a sane default if no fallback is provided.
    getConfiguration: () => ({
      get: (_key: string, fallback?: any) =>
        fallback ?? ['for', 'const', 'function', 'email', 'key', 'includes'],
    }),
  },
});

/** --- Glossary stub so createHardSet has deterministic base terms --- */
const fakeGlossary = { javascript: [' for ', 'const', '  function  ', 'function'] };
mock('../glossaries/javascript-hard.json', fakeGlossary);
mock('../../glossaries/javascript-hard.json', fakeGlossary);

/** --- Load controllers AFTER mocks --- */
const maskMod = require('../controllers/maskAIController');
const { unmaskLines } = require('../controllers/unmaskController');

/** Helpers */
const DEFAULT_KW = ['for', 'const', 'function', 'email', 'key'];

async function runController(fn: Function, input: string): Promise<string> {
  currentText = input;
  let out: any;

  // If the function is declared with 2+ parameters, give it keywords explicitly.
  if (fn.length >= 2) out = fn(input, DEFAULT_KW);
  else if (fn.length >= 1) out = fn(input);
  else out = fn();

  out = await Promise.resolve(out);

  if (typeof out === 'string') return out;
  // If the controller edits the VS Code buffer, return the mutated content.
  return currentText;
}

describe('maskAIController (3 exports) + unmaskController', () => {
  it('maskAIController exposes exactly three functions', () => {
    const fns = Object.entries(maskMod).filter(([, v]) => typeof v === 'function');
    expect(fns.length).to.equal(3, `Expected 3 exported functions, saw: ${fns.map(([k])=>k).join(', ')}`);
  });

  it('createHardSet merges base glossary + extras, trims & dedupes', () => {
    const { createHardSet } = maskMod;
    expect(createHardSet).to.be.a('function');

    const extra = ['let', 'Const', ' ', null, 42, 'function'];
    const out = createHardSet(extra as any);

    expect(out).to.be.an('array');
    expect(out).to.include('for');       // from ' for ' (trim)
    expect(out).to.include('const');     // base glossary
    expect(out).to.include('function');  // base glossary
    expect(out).to.include('let');       // from extras
    expect(out).to.not.include('');
    expect(out.filter((x: string) => x === 'function').length).to.equal(1); // deduped
  });

  it('unmaskLines replaces tokens with originals (and handles overlaps)', () => {
    // basic replace
    const lines = ['Hello __A__', 'Path: __B__/x'];
    const map = [
      { token: '__A__', original: 'world', kind: 'id' },
      { token: '__B__', original: '/usr', kind: 'path' },
    ];
    expect(unmaskLines(lines, map)).to.deep.equal(['Hello world', 'Path: /usr/x']);

    // overlap: longer token first
    const lines2 = ['X=__MASK_123__ Y=__MASK_12__'];
    const map2 = [
      { token: '__MASK_12__', original: 'TWELVE', kind: 'id' },
      { token: '__MASK_123__', original: 'ONE-TWO-THREE', kind: 'id' },
    ];
    expect(unmaskLines(lines2, map2)[0]).to.equal('X=ONE-TWO-THREE Y=TWELVE');
  });
});
