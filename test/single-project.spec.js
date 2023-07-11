const { exec, getFixturePath } = require('./helpers');

describe.each([
  ['yarn', 'yarn.lock'],
  ['npm', 'package-lock.json'],
])('diglett %s', (command, lockfileName) => {
  describe("Project that doesn't exist", () => {
    const fixture = getFixturePath('non-existing');
    it('fails', async () => {
      const { stderr } = await exec([command, fixture]);
      expect(stderr).toContain('File package.json not found');
    });
  });

  describe('Project without lockfile', () => {
    const fixture = getFixturePath('no-lockfile');
    it('fails', async () => {
      const { stderr } = await exec([command, fixture]);
      expect(stderr).toContain(`File ${lockfileName} not found`);
    });
  });

  describe('Project with stale lockfile', () => {
    const fixture = getFixturePath('stale-lockfile');
    it('fails', async () => {
      const { stderr } = await exec([command, fixture]);
      expect(stderr).toContain(`Unable to find resolution`);
    });
  });

  describe.each(['regular', 'yarn-berry'])(
    '%s package with duplicate dependencies',
    fixtureName => {
      const fixture = getFixturePath(fixtureName);
      it('fails with 9 duplicate dependencies', async () => {
        const { stderr } = await exec([command, fixture]);
        expect(stderr).toContain('Found 9 duplicate dependencies');
      });

      it('passes with non-matching filter', async () => {
        const { stderr } = await exec([command, fixture, '--filter', 'hest']);
        expect(stderr).toBeFalsy();
      });

      it('fails with matching filter', async () => {
        const { stderr } = await exec([
          command,
          fixture,
          '--filter',
          '^@material/ripple$',
        ]);
        expect(stderr).toContain('Found 1 duplicate dependency');
      });
    }
  );

  describe('Package with duplicate devDependencies', () => {
    const fixture = getFixturePath('dev-dependencies');
    it('passes without --dev flag', async () => {
      const { stdout, stderr } = await exec([command, fixture]);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('fails with --dev flag', async () => {
      const { stderr } = await exec([command, fixture, '--dev']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });

    it('fails with --all flag', async () => {
      const { stderr } = await exec([command, fixture, '--all']);
      expect(stderr).toContain('Found 9 duplicate dependencies');
    });
  });
});
