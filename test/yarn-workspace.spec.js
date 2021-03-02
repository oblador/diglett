const path = require('path');
const stripAnsi = require('strip-ansi');
const { exec, getFixturePath } = require('./helpers');

describe('diglett workspace', () => {
  describe('Non-existing project', () => {
    it('fails', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        getFixturePath('non-existing'),
      ]);
      expect(stderr).toContain('File package.json not found');
    });
  });

  const fixture = getFixturePath('workspace');

  describe('Entire workspace', () => {
    it('fails with duplicate dependencies', async () => {
      const { stderr } = await exec(['yarn-workspace', fixture]);
      expect(stripAnsi(stderr)).toMatchInlineSnapshot(`
        "Found 13 duplicate dependencies
        @material/animation with versions 3.1.0, 4.0.0.
        @material/base with versions 3.1.0, 4.0.0.
        @material/dom with versions 3.1.0, 4.0.0.
        @material/feature-targeting with versions 3.1.0, 4.0.0.
        @material/floating-label with versions 3.2.0, 4.0.0.
        @material/line-ripple with versions 3.1.0, 4.0.0.
        @material/notched-outline with versions 3.2.0, 4.0.0.
        @material/ripple with versions 3.2.0, 4.0.0.
        @material/rtl with versions 3.2.0, 4.0.0.
        @material/shape with versions 3.1.0, 4.0.0.
        @material/textfield with versions 3.2.0, 4.0.0.
        @material/theme with versions 3.1.0, 4.0.0.
        @material/typography with versions 3.1.0, 4.0.0.
        "
      `);
    });

    it('fails for dependencies defined in root', async () => {
      const { stderr } = await exec(['yarn-workspace', fixture]);
      expect(stderr).toContain('@material/textfield');
    });

    it('passes with non-matching filter', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--filter=hest',
      ]);
      expect(stderr).toBeFalsy();
    });

    it('fails with matching filter', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--filter=^@material/ripple$',
      ]);
      expect(stderr).toContain('Found 1 duplicate dependency');
    });
  });

  describe('Non-existing package', () => {
    it('fails', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--package=non-existing',
      ]);
      expect(stderr).toContain('Invalid --package argument passed');
    });
  });

  describe('Package with duplicate dependencies', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--package=diglett-workspace-regular',
      ]);
      expect(stripAnsi(stderr)).toMatchInlineSnapshot(`
        "Found 9 duplicate dependencies
        @material/animation with versions 3.1.0, 4.0.0.
        @material/base with versions 3.1.0, 4.0.0.
        @material/dom with versions 3.1.0, 4.0.0.
        @material/feature-targeting with versions 3.1.0, 4.0.0.
        @material/ripple with versions 3.2.0, 4.0.0.
        @material/rtl with versions 3.2.0, 4.0.0.
        @material/shape with versions 3.1.0, 4.0.0.
        @material/theme with versions 3.1.0, 4.0.0.
        @material/typography with versions 3.1.0, 4.0.0.
        "
      `);
    });
  });

  describe('Package with duplicate cross dependencies', () => {
    it('fails with 9 duplicate dependencies', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--package=diglett-workspace-cross-dependency',
      ]);
      expect(stripAnsi(stderr)).toMatchInlineSnapshot(`
        "Found 9 duplicate dependencies
        @material/animation with versions 3.1.0, 4.0.0.
        @material/base with versions 3.1.0, 4.0.0.
        @material/dom with versions 3.1.0, 4.0.0.
        @material/feature-targeting with versions 3.1.0, 4.0.0.
        @material/ripple with versions 3.2.0, 4.0.0.
        @material/rtl with versions 3.2.0, 4.0.0.
        @material/shape with versions 3.1.0, 4.0.0.
        @material/theme with versions 3.1.0, 4.0.0.
        @material/typography with versions 3.1.0, 4.0.0.
        "
      `);
    });

    it('ignores devDependencies from cross dependencies with --dev flag', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
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
        'yarn-workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
      ]);
      expect(stderr).toBeFalsy();
      expect(stdout).toContain('No duplicate dependencies found');
    });

    it('fails with --dev flag', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
        '--dev',
      ]);
      expect(stripAnsi(stderr)).toMatchInlineSnapshot(`
        "Found 9 duplicate dependencies
        @material/animation with versions 3.1.0, 4.0.0.
        @material/base with versions 3.1.0, 4.0.0.
        @material/dom with versions 3.1.0, 4.0.0.
        @material/feature-targeting with versions 3.1.0, 4.0.0.
        @material/ripple with versions 3.2.0, 4.0.0.
        @material/rtl with versions 3.2.0, 4.0.0.
        @material/shape with versions 3.1.0, 4.0.0.
        @material/theme with versions 3.1.0, 4.0.0.
        @material/typography with versions 3.1.0, 4.0.0.
        "
      `);
    });

    it('fails with --all flag', async () => {
      const { stderr } = await exec([
        'yarn-workspace',
        fixture,
        '--package=diglett-workspace-dev-dependencies',
        '--all',
      ]);
      expect(stripAnsi(stderr)).toMatchInlineSnapshot(`
        "Found 9 duplicate dependencies
        @material/animation with versions 3.1.0, 4.0.0.
        @material/base with versions 3.1.0, 4.0.0.
        @material/dom with versions 3.1.0, 4.0.0.
        @material/feature-targeting with versions 3.1.0, 4.0.0.
        @material/ripple with versions 3.2.0, 4.0.0.
        @material/rtl with versions 3.2.0, 4.0.0.
        @material/shape with versions 3.1.0, 4.0.0.
        @material/theme with versions 3.1.0, 4.0.0.
        @material/typography with versions 3.1.0, 4.0.0.
        "
      `);
    });
  });
});
