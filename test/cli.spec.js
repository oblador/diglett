const path = require('path');
const child_process = require('child_process');

const DIGLETT_PATH = path.join(path.dirname(__dirname), 'bin', 'diglett');

const execFixture = (fixtureName, flags = []) =>
  new Promise(resolve => {
    child_process.exec(
      `${DIGLETT_PATH} ${__dirname}/fixtures/${fixtureName} ${flags.join(' ')}`,
      (err, stdout, stderr) => {
        resolve({ stdout, stderr });
      }
    );
  });

describe.each([
  ['Isolated package', ''],
  ['Yarn workspaces', 'workspaces/packages/'],
])('%s', (name, pathPrefix) => {
  describe('Package with duplicate dependencies', () => {
    const fixture = `${pathPrefix}regular`;
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await execFixture(fixture);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with non-matching filter', async () => {
      const { stderr } = await execFixture(fixture, ['--filter', 'hest']);
      expect(stderr).toBeFalsy();
    });

    it('fails with matching filter', async () => {
      const { stderr } = await execFixture(fixture, [
        '--filter',
        '^@material/ripple$',
      ]);
      expect(stderr).toContain('Found 1 duplicate dependency');
    });
  });

  describe('Package with duplicate devDependencies', () => {
    const fixture = `${pathPrefix}dev-dependencies`;
    it('passes without --dev flag', async () => {
      const { stdout, stderr } = await execFixture(fixture, []);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('passes with --dev flag', async () => {
      const { stderr } = await execFixture(fixture, ['--dev']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with --all flag', async () => {
      const { stderr } = await execFixture(fixture, ['--all']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });
});
