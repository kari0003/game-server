import { logger } from '@matchmaker/util/logger';
import { testPlayerAdd, testPlayerRemove, testFindMatch, testStartMatch, testFailMatch } from './queuePlayerManagement';

Promise.all([
  testGenerator(testPlayerAdd),
  testGenerator(testPlayerRemove),
  testGenerator(testFindMatch),
  testGenerator(testStartMatch),
  testGenerator(testFailMatch),
  ]
)
.then(() => {
  return process.exit();
})
.catch((error) => {
  logger.error('Tests failed', error);
  return process.exit(1);
});

function testGenerator(testFunct: Function): Promise<any> {
  return testFunct()
  .then(() => console.log('\x1b[32m%s\x1b[0m', 'test succesful!', testFunct.name))
  .catch((err) => {
    logger.error('test failed', err);
  });
}
