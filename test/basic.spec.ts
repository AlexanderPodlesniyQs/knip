import test from 'node:test';
import assert from 'node:assert';
import { main } from '../src';

test('Find unused files and exports', async () => {
  const workingDir = 'test/fixtures/basic';

  const { issues, counters } = await main({
    cwd: workingDir,
    workingDir,
    include: [],
    exclude: [],
    ignore: [],
    isNoGitIgnore: true,
    isDev: false,
    isShowProgress: false,
    jsDoc: [],
  });

  assert(issues.files.size === 1);
  assert(Array.from(issues.files)[0].endsWith('dangling.ts'));

  assert(Object.values(issues.exports).length === 1);
  assert(issues.exports['dep.ts']['unused'].symbol === 'unused');

  assert(Object.values(issues.types).length === 1);
  assert(issues.types['dep.ts']['Dep'].symbolType === 'type');

  assert(Object.values(issues.nsExports).length === 1);
  assert(issues.nsExports['ns.ts']['z'].symbol === 'z');

  assert(Object.values(issues.nsTypes).length === 1);
  assert(issues.nsTypes['ns.ts']['NS'].symbol === 'NS');

  assert(Object.values(issues.duplicates).length === 1);
  assert(issues.duplicates['dep.ts']['dep|default'].symbols?.[0] === 'dep');

  assert.deepEqual(counters, {
    dependencies: 0,
    devDependencies: 0,
    duplicates: 1,
    exports: 1,
    files: 1,
    nsExports: 1,
    nsTypes: 1,
    processed: 3,
    types: 1,
    unresolved: 0,
  });
});
