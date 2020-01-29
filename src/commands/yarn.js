const path = require('path');
const chalk = require('chalk');
const sharedArguments = require('../sharedArguments');
const { readLockfile, readPackageJSON } = require('../fs');
const getDuplicateDependencies = require('../getDuplicateDependencies');

exports.command = 'yarn [project-path]';

exports.describe = 'Check regular yarn project';

exports.builder = {
  ...sharedArguments,
};

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readLockfile(projectPath);

  const packageDependencies = [
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ]
    .filter(dependencyGroup => argv.allDependencies || argv[dependencyGroup])
    .concat('dependencies')
    .map(dependencyGroup => packageJSON[dependencyGroup])
    .filter(Boolean)
    .reduce((acc, current) => Object.assign(acc, current), {});

  const duplicates = getDuplicateDependencies(
    lockfile,
    packageDependencies,
    argv.filter
  );

  if (duplicates.size !== 0) {
    console.error(
      chalk.bold.red(
        `Found ${duplicates.size} duplicate ${
          duplicates.size === 1 ? 'dependency' : 'dependencies'
        }`
      )
    );
    duplicates.forEach((versions, packageName) => {
      console.warn(
        `${chalk.bold(packageName)} with versions ${Array.from(versions).join(
          ', '
        )}.`
      );
    });
    console.info(
      chalk.dim(
        '\n- Run `yarn why <package>` to find which dependencies mismatch. \n- Consider adding a manual override using the `resolutions` field in your package.json.'
      )
    );
    process.exit(1);
  } else {
    console.info('No duplicate dependencies found');
  }
};
