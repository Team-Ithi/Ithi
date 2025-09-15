// Precompile-friendly CommonJS test that mocks `vscode` and calls astParseTraverse
/* eslint-disable @typescript-eslint/no-var-requires */
const mock = require('mock-require');
const { expect } = require('chai');

// ----- stub VS Code API BEFORE requiring the controller -----
const codeSample = `
// calling add later
// TODO: refactor add
class Animal {}
class Dog extends Animal { bark(){} }
function add(a,b){ return a + b; }
const z = 1;
/* block for add and Animal */
`;

mock('vscode', {
  window: {
    activeTextEditor: {
      document: {
        languageId: 'javascript',
        getText: () => codeSample,
      },
    },
  },
});

const { astParseTraverse } = require('../controllers/astController');

describe('astController.astParseTraverse', () => {
  it('returns comments with augmentation fields', () => {
    const comments = astParseTraverse(); // no args; reads from mocked editor
    expect(comments).to.be.an('array');
    expect(comments.length).to.be.greaterThan(0);

    const augmented = comments.find(
      (c: any) =>
        Array.isArray(c.nearByLines) && Array.isArray(c.matchedKeywords)
    );

    expect(augmented, 'Expected an augmented comment').to.exist;
    expect(augmented.nearByLines).to.be.an('array').and.not.empty;
    expect(augmented.matchedKeywords).to.be.an('array'); // may include 'add'/'Animal' depending on your matching
  });
});
