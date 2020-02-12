const path = require('path');
const sharedArguments = require('../sharedArguments');
const { readYarnLockfile, readPackageJSON } = require('../fs');
const groupYarnDependencies = require('../groupYarnDependencies');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const getDependencyGroupsFromArgv = require('../getDependencyGroupsFromArgv');
const printResult = require('../printResult');

exports.command = 'yarn [project-path]';

exports.describe = 'Check regular yarn project';

exports.builder = {
  ...sharedArguments,
};

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readYarnLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const packageDependencies = getPackageDependencies(
    packageJSON,
    dependencyGroups
  );

  const groupedVersions = groupYarnDependencies(packageDependencies, lockfile);

  const duplicates = getDuplicateDependencies(groupedVersions, argv.filter);

  printResult(duplicates, true);
};
