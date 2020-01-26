const fs = require('fs');
const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const lockfile = require('@yarnpkg/lockfile');
const getDuplicateDependencies = require('./getDuplicateDependencies');

function die(message) {
  console.error(message);
  process.exit(1);
}

function parseRegex(value) {
  return value && new RegExp(value);
}

function main() {
  const program = new commander.Command();
  const version = require('../package.json').version;
  program
    .version(version)
    .usage('[options] [project path (default: ./)]')
    .option(
      '--filter <regex>',
      'filter packages by regular expression',
      parseRegex
    )
    .option('--all, --allDependencies', 'include all package dependencies')
    .option('--dev, --devDependencies', 'include packages in devDependencies')
    .option(
      '--optional, --optionalDependencies',
      'include packages in optionalDependencies'
    )
    .option(
      '--peer, --peerDependencies',
      'include packages in peerDependencies'
    );

  program.parse(process.argv);

  const projectPath = path.resolve(program.args[0] || './');

  function readFile(fileName) {
    const filePath = path.join(projectPath, fileName);
    if (!fs.existsSync(filePath)) {
      die(
        `File ${fileName} not found in ${projectPath}. Please supply a valid path to a yarn project.`
      );
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  const parsedLockFile = lockfile.parse(readFile('yarn.lock'));
  if (parsedLockFile.type !== 'success') {
    die('Failed to parse lockfile');
  }

  const packageJSON = JSON.parse(readFile('package.json'));

  const packageDependencies = [
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ]
    .filter(
      dependencyGroup => program.allDependencies || program[dependencyGroup]
    )
    .concat('dependencies')
    .map(dependencyGroup => packageJSON[dependencyGroup])
    .filter(Boolean)
    .reduce((acc, current) => Object.assign(acc, current), {});

  const duplicates = getDuplicateDependencies(
    parsedLockFile.object,
    packageDependencies,
    program.filter
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
}

module.exports = main;
