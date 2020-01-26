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

describe('diglett CLI', () => {
  describe('Non-existing project', () => {
    it('fails', async () => {
      const { stderr } = await execFixture('non-existing');
      expect(stderr).toContain('File yarn.lock not found');
    });
  });

  describe('Package with duplicate dependencies', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await execFixture('regular');
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with non-matching filter', async () => {
      const { stderr } = await execFixture('regular', ['--filter', 'hest']);
      expect(stderr).toBeFalsy();
    });

    it('fails with matching filter', async () => {
      const { stderr } = await execFixture('regular', [
        '--filter',
        '^@material/ripple$',
      ]);
      expect(stderr).toContain('Found 1 duplicate dependency');
    });
  });

  describe('Package with duplicate devDependencies', () => {
    it('passes without --dev flag', async () => {
      const { stdout, stderr } = await execFixture('devDependencies', []);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('passes with --dev flag', async () => {
      const { stderr } = await execFixture('devDependencies', ['--dev']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with --all flag', async () => {
      const { stderr } = await execFixture('devDependencies', ['--all']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });
});
