module.exports = {
  require: ['ts-node/register'],
  extension: ['ts'],
  spec: ['src/test/astController.test.ts'],
  timeout: 10000,
  reporter: 'spec',
};