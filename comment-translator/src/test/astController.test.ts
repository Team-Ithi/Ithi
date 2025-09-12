// src/test/astController.test.ts
const { expect } = require('chai');
const mod: any = require('../controllers/astController');


// Try common export names; fall back to default.
const candidateFn: any =
  mod.analyze ??
  mod.analyzeAST ??
  mod.parse ??
  mod.build ??
  mod.run ??
  mod.default;

/** Minimal shapes expected from astController output */
type FunctionInfo = { name: string; params?: unknown };
type VariableInfo = { name: string };
type ClassInfo = { name: string; superClass?: string };
type AugmentedComment = {
  value: string;
  nearByLines?: string[];
  matchedKeywords?: string[];
  // loc may exist, but we don't assert on it here
  loc?: { start: { line: number }; end: { line: number } };
};

type AnalyzerResult = {
  functions?: FunctionInfo[];
  variables?: VariableInfo[];
  classes?: ClassInfo[];
  comments?: AugmentedComment[];
};

// Small helper that safely awaits either sync or async implementations
const analyze = async (code: string): Promise<AnalyzerResult> => {
  const out = candidateFn.length >= 1 ? candidateFn(code) : candidateFn({ code });
  return await Promise.resolve(out);
};

describe('astController', () => {
  const sampleCode = `
/**
 * TODO: add docs
 */
 // top line comment
 // fix later
class Animal {}
class Dog extends Animal {
  bark() {}
}

function add(a, b) {
  // TODO: check types
  const x = a + b;
  return x;
}

const y = 1;
`;

  it('parses basic code and returns structured arrays', async () => {
    const result = await analyze(sampleCode);

    // Shape checks
    expect(result).to.be.an('object');
    expect(result).to.have.property('functions');
    expect(result).to.have.property('variables');
    expect(result).to.have.property('classes');
    expect(result).to.have.property('comments');

    // Type checks
    expect(result.functions).to.be.an('array');
    expect(result.variables).to.be.an('array');
    expect(result.classes).to.be.an('array');
    expect(result.comments).to.be.an('array');
  });

  it('detects a named function declaration', async () => {
    const { functions = [] } = await analyze(sampleCode);
    const names = functions.map((f) => (f as FunctionInfo).name);
    expect(names).to.include('add');
  });

  it('detects a top-level variable declaration', async () => {
    const { variables = [] } = await analyze(sampleCode);
    const vnames = variables.map((v) => (v as VariableInfo).name);
    // We only assert on a top-level var to avoid depending on inner-scope capture behavior.
    expect(vnames).to.include('y');
  });

  it('detects a class and (optionally) its superclass', async () => {
    const { classes = [] } = await analyze(sampleCode);
    const cnames = classes.map((c) => (c as ClassInfo).name);
    expect(cnames).to.include('Dog');

    const dog = classes.find((c) => (c as ClassInfo).name === 'Dog') as ClassInfo | undefined;
    // Some implementations may not resolve superClass -> assert softly
    if (dog && 'superClass' in dog) {
      expect(dog.superClass).to.be.oneOf([undefined, null, 'Animal']);
    }
  });

  it('collects comments and augments them with nearByLines/matchedKeywords arrays', async () => {
    const { comments = [] } = await analyze(sampleCode);
    expect(comments.length).to.be.greaterThan(0);

    // At least one comment should have the augmented fields present as arrays.
    const augmented = comments.find(
      (c) => Array.isArray((c as AugmentedComment).nearByLines) && Array.isArray((c as AugmentedComment).matchedKeywords)
    ) as AugmentedComment | undefined;

    expect(augmented, 'Expected at least one augmented comment').to.exist;
    expect(augmented!.nearByLines).to.be.an('array');

    // We avoid asserting exact contents since implementations may vary,
    // but nearByLines should typically include some nearby code text.
    if (augmented!.nearByLines && augmented!.nearByLines.length > 0) {
      const joined = augmented!.nearByLines.join('\n');
      expect(joined).to.be.a('string').and.not.empty;
    }

    // matchedKeywords may be empty depending on your controller's keyword source.
    expect(augmented!.matchedKeywords).to.be.an('array');
  });

  it('handles empty input without throwing', async () => {
    const result = await analyze('');
    // Should still return the same shape
    expect(result).to.be.an('object');
    expect(result.functions).to.be.an('array');
    expect(result.variables).to.be.an('array');
    expect(result.classes).to.be.an('array');
    expect(result.comments).to.be.an('array');
  });
});
