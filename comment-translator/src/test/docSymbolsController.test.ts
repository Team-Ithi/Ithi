//getting an error using import, using require throughout
const sinon = require('sinon');
const { expect } = require('chai');
const mock = require('mock-require');

// Import the mock VS Code module
import {
  mockVscode,
  mockTextEditor,
  mockSymbolProviderResult,
} from './vscode.mock';

/* A 'stub' is a basic, placeholder piece of code that replaces a real component
or dependency, providing predetermined, static responses to function calls. 
Stubs are used to isolate the "unit under test" so its behavior can be examined independently 
of other, potentially incomplete or unavailable, parts of the system. 
This allows for consistent and predictable test results, even when 
the actual dependency is not yet built or accessible. */

// stub VS Code API BEFORE requiring the controller
mock('vscode', {});

// Use a global mock to intercept imports of 'vscode'
// This ensures the Symbols class uses the mock
const vscode = require('vscode');
Object.assign(vscode, mockVscode);

const { Symbols } = require('../controllers/docSymbolsController');

describe('docSymbolsController', () => {
  let symbols: typeof Symbols;

  // Reset mocks before each test
  beforeEach(() => {
    mockVscode.commands.executeCommand.reset();
    symbols = new Symbols();
  });

  describe('test getAllNames method', () => {
    it('should correctly extract all names from a flat list of symbols', () => {
      const data = [{ name: 'symbol1' }, { name: 'symbol2' }];
      const names = symbols.getAllNames(data as any);
      expect(names.size).to.equal(2);
      expect(names.has('symbol1')).to.be.true;
      expect(names.has('symbol2')).to.be.true;
    });

    it('should correctly extract names from a nested list of symbols', () => {
      const data = [
        { name: 'symbol1', children: [{ name: 'child1' }] },
        { name: 'symbol2', children: [] },
      ];
      const names = symbols.getAllNames(data as any);
      expect(names.size).to.equal(3);
      expect(names.has('symbol1')).to.be.true;
      expect(names.has('symbol2')).to.be.true;
      expect(names.has('child1')).to.be.true;
    });

    it('should handle an empty list of symbols', () => {
      const data: any[] = [];
      const names = symbols.getAllNames(data);
      expect(names.size).to.equal(0);
    });

    it('should not add duplicate names to the set', () => {
      const data = [
        { name: 'duplicate' },
        { name: 'unique' },
        { name: 'duplicate' },
      ];
      const names = symbols.getAllNames(data as any);
      expect(names.size).to.equal(2);
      expect(names.has('duplicate')).to.be.true;
      expect(names.has('unique')).to.be.true;
    });
  });

  describe('test getDocumentSymbols method', () => {
    it('should correctly call executeCommand and set properties for a valid file', async () => {
      // Stub the command to return our mock data
      mockVscode.commands.executeCommand.resolves(mockSymbolProviderResult);
      await symbols.getDocumentSymbols();
      // Assert executeCommand was called with the correct arguments
      expect(mockVscode.commands.executeCommand.calledOnce).to.be.true;
      expect(
        mockVscode.commands.executeCommand.calledWith(
          'vscode.executeDocumentSymbolProvider',
          mockTextEditor.document.uri
        )
      ).to.be.true;
      // Assert that fileName and fileType properties are set correctly
      expect(symbols.fileName).to.equal('file.js');
      expect(symbols.fileType).to.equal('javascript');
    });

    it('should handle unsupported file types gracefully', async () => {
      const originalFileType = mockTextEditor.document.languageId;
      mockTextEditor.document.languageId = 'unsupported';
      const consoleErrorSpy = sinon.spy(console, 'error');
      await symbols.getDocumentSymbols();
      // Assert that an error was logged and the properties were set
      expect(consoleErrorSpy.calledWith('unsupported file type: unsupported'))
        .to.be.true;
      expect(symbols.fileType).to.equal('unsupported');
      // Restore console.error and fileType
      consoleErrorSpy.restore();
      mockTextEditor.document.languageId = originalFileType;
    });

    it('should return if no active editor is found', async () => {
      // Stub the active editor to be undefined
      sinon.stub(mockVscode.window, 'activeTextEditor').value(undefined);
      const result = await symbols.getDocumentSymbols();
      // Test that the method returns early
      expect(result).to.be.undefined;
      // Also ensure that executeCommand was never called
      expect(mockVscode.commands.executeCommand.called).to.be.false;
    });
  });
});
