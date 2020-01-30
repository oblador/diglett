const path = require('path');
const { exec, getFixturePath } = require('./helpers');

describe('diglett workspace', () => {
  describe('Non-existing project', () => {
    it('fails', async () => {
      const { stderr } = await exec([
        'workspace',
        getFixturePath('non-existing'),
      ]);
      expect(stderr).toContain('File package.json not found');
    });
  });

  const fixture = getFixturePath('workspace');

  describe('Entire workspace', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec(['workspace', fixture]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('passes with non-matching filter', async () => {
      const { stderr } = await exec(['workspace', fixture, '--filter=hest']);
      expect(stderr).toBeFalsy();
    });

    it('fails with matching filter', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--filter=^@material/ripple$',
      ]);
      expect(stderr).toContain('Found 1 duplicate dependency');
    });
  });

  describe('Non-existing package', () => {
    it('fails', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=non-existing',
      ]);
      expect(stderr).toContain('Invalid --package argument passed');
    });
  });

  describe('Package with duplicate dependencies', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-regular',
      ]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });

  describe('Package with duplicate cross dependencies', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-cross-dependency',
      ]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('ignores devDependencies from cross dependencies with --dev flag', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-cross-dependency',
        '--dev',
      ]);
      expect(stderr).not.toContain('@material/base with versions 3.0.0');
    });
  });

  describe('Package with duplicate devDependencies', () => {
    it('passes without --dev flag', async () => {
      const { stdout, stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
      ]);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('fails with --dev flag', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
        '--dev',
      ]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('fails with --all flag', async () => {
      const { stderr } = await exec([
        'workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
        '--all',
      ]);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });
});
