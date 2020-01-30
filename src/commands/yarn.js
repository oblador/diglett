const path = require('path');
const sharedArguments = require('../sharedArguments');
const { readLockfile, readPackageJSON } = require('../fs');
const groupResolvedDependencies = require('../groupResolvedDependencies');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const printResult = require('../printResult');

exports.command = 'yarn [project-path]';

exports.describe = 'Check regular yarn project';

exports.builder = {
  ...sharedArguments,
};

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readLockfile(projectPath);

  const packageDependencies = getPackageDependencies(packageJSON, argv);

  const groupedVersions = groupResolvedDependencies(
    packageDependencies,
    lockfile
  );

  const duplicates = getDuplicateDependencies(groupedVersions, argv.filter);

  printResult(duplicates);
};
