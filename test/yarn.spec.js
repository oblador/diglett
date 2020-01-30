const path = require('path');
const { exec, getFixturePath } = require('./helpers');

describe('diglett yarn', () => {
  describe('Non-existing project', () => {
    const fixture = getFixturePath('non-existing');
    it('fails', async () => {
      const { stderr } = await exec(['yarn', fixture]);
      expect(stderr).toContain('File package.json not found');
    });
  });

  describe('Package with duplicate dependencies', () => {
    const fixture = getFixturePath('regular');
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec(['yarn', fixture]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with non-matching filter', async () => {
      const { stderr } = await exec(['yarn', fixture, '--filter', 'hest']);
      expect(stderr).toBeFalsy();
    });

    it('fails with matching filter', async () => {
      const { stderr } = await exec([
        'yarn',
        fixture,
        '--filter',
        '^@material/ripple$',
      ]);
      expect(stderr).toContain('Found 1 duplicate dependency');
    });
  });

  describe('Package with duplicate devDependencies', () => {
    const fixture = getFixturePath('dev-dependencies');
    it('passes without --dev flag', async () => {
      const { stdout, stderr } = await exec(['yarn', fixture]);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('fails with --dev flag', async () => {
      const { stderr } = await exec(['yarn', fixture, '--dev']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('fails with --all flag', async () => {
      const { stderr } = await exec(['yarn', fixture, '--all']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });
});
