const path = require('path');
const sharedArguments = require('../sharedArguments');
const { readNpmLockfile, readPackageJSON } = require('../fs');
const groupNpmDependencies = require('../groupNpmDependencies');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const getDependencyGroupsFromArgv = require('../getDependencyGroupsFromArgv');
const printResult = require('../printResult');

exports.command = 'npm [project-path]';

exports.describe = 'Check npm project';

exports.builder = {
  ...sharedArguments,
};

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readNpmLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const packageDependencies = getPackageDependencies(
    packageJSON,
    dependencyGroups
  );

  const groupedVersions = groupNpmDependencies(packageDependencies, lockfile);

  const duplicates = getDuplicateDependencies(groupedVersions, argv.filter);

  printResult(duplicates);
};
