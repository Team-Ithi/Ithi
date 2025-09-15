module.exports = {
  require: ['ts-node/register'],
  extension: ['ts'],
  spec: [
    'src/test/astController.test.ts',
    'src/test/docSymbolsController.test.ts',
  ],
  timeout: 10000,
  reporter: 'spec',
};
