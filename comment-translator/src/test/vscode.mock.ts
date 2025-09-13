import sinon from 'sinon';

export const mockUri = {
  fsPath: '/mock/path/to/file.ts',
};

export const mockTextDocument = {
  uri: mockUri,
  languageId: 'typescript',
  fileName: '/mock/path/to/file.ts',
};

export const mockTextEditor = {
  document: mockTextDocument,
};

export const mockSymbolProviderResult = [
  {
    name: 'ClassA',
    kind: 5,
    children: [
      { name: 'methodA', kind: 6, children: [] },
      { name: 'propA', kind: 7, children: [] },
    ],
  },
  {
    name: 'ClassB',
    kind: 5,
    children: [{ name: 'methodB', kind: 6, children: [] }],
  },
];

export const mockVscode = {
  window: {
    activeTextEditor: mockTextEditor,
  },
  commands: {
    executeCommand: sinon.stub(),
  },
  Uri: {
    parse: sinon.stub().returns(mockUri),
  },
};
