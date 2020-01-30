const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharedArguments = require('../sharedArguments');
const { InvalidProjectTypeError } = require('../errors');
const { readLockfile, readPackageJSON } = require('../fs');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const groupResolvedDependencies = require('../groupResolvedDependencies');
const printResult = require('../printResult');

exports.command = 'workspace [project-path]';

exports.describe = 'Check yarn workspaces project';

exports.builder = {
  ...sharedArguments,
};

function readPackageJSONSafely(projectPath) {
  try {
    return readPackageJSON(projectPath);
  } catch (_error) {
    return null;
  }
}

function omit(keysToOmit) {
  return object =>
    Object.keys(object)
      .filter(key => !keysToOmit.includes(key))
      .reduce((acc, key) => {
        acc[key] = object[key];
        return acc;
      }, {});
}

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readLockfile(projectPath);

  const { workspaces } = packageJSON;
  if (!workspaces || !workspaces.packages) {
    throw new InvalidProjectTypeError('Project is not a valid yarn workspace');
  }

  const packages = workspaces.packages
    .map(pattern => glob.sync(pattern, { cwd: projectPath }))
    .reduce((acc, arr) => acc.concat(arr), [])
    .map(packagePath =>
      readPackageJSONSafely(path.join(projectPath, packagePath))
    )
    .filter(Boolean);

  const versions = packages
    .map(packageJSON => getPackageDependencies(packageJSON, argv))
    .map(omit(packages.map(packageJSON => packageJSON.name)))
    .reduce(
      (acc, packageDependencies) =>
        groupResolvedDependencies(packageDependencies, lockfile, acc),
      new Map()
    );

  const duplicates = getDuplicateDependencies(versions, argv.filter);

  printResult(duplicates);
};
