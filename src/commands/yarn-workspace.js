const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharedArguments = require('../sharedArguments');
const { InvalidProjectTypeError, InvalidArgumentError } = require('../errors');
const { readLockfile, readPackageJSON } = require('../fs');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const getDependencyGroupsFromArgv = require('../getDependencyGroupsFromArgv');
const groupResolvedDependencies = require('../groupResolvedDependencies');
const printResult = require('../printResult');

exports.command = 'yarn-workspace [project-path]';

exports.describe = 'Check yarn workspaces project';

exports.builder = {
  package: {
    alias: 'scope',
    description: 'workspace package to analyze',
    type: 'string',
  },
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

function getWorkspaceDependencies(
  packageName,
  packages,
  accumulatedPackageNames = new Set()
) {
  const pkg = packages.get(packageName);
  const dependencies = pkg.dependencies || {};

  return Object.keys(dependencies)
    .filter(key => packages.has(key))
    .reduce((acc, key) => {
      if (!acc.has(key)) {
        acc.add(key);
        return getWorkspaceDependencies(key, packages, accumulatedPackageNames);
      }
      return acc;
    }, accumulatedPackageNames);
}

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const { workspaces } = packageJSON;
  if (!workspaces || !Array.isArray(workspaces.packages || workspaces)) {
    throw new InvalidProjectTypeError('Project is not a valid yarn workspace');
  }

  const packages = (workspaces.packages || workspaces)
    .map(pattern => glob.sync(pattern, { cwd: projectPath }))
    .reduce((acc, arr) => acc.concat(arr), [])
    .map(packagePath =>
      readPackageJSONSafely(path.join(projectPath, packagePath))
    )
    .filter(Boolean)
    .reduce((acc, pkg) => acc.set(pkg.name, pkg), new Map());

  const packageNames = Array.from(packages.keys());
  const whitelist = argv.package ? [].concat(argv.package) : packageNames;

  if (argv.package) {
    whitelist.forEach(packageName => {
      if (!packages.has(packageName)) {
        throw new InvalidArgumentError(
          `Invalid --package argument passed; package "${packageName}" does not exist`
        );
      }
    });
  }

  const versions = whitelist
    .map(packageName =>
      [
        getPackageDependencies(packages.get(packageName), dependencyGroups),
      ].concat(
        Array.from(
          getWorkspaceDependencies(packageName, packages)
        ).map(packageName => getPackageDependencies(packages.get(packageName)))
      )
    )
    .reduce((acc, arr) => Array.from(new Set(acc.concat(arr))), [])
    .map(omit(packageNames))
    .reduce(
      (acc, packageDependencies) =>
        groupResolvedDependencies(packageDependencies, lockfile, acc),
      new Map()
    );

  const duplicates = getDuplicateDependencies(versions, argv.filter);

  printResult(duplicates);
};
