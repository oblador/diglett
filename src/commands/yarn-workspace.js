const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharedArguments = require('../sharedArguments');
const { InvalidProjectTypeError, InvalidArgumentError } = require('../errors');
const { readYarnLockfile, readPackageJSON } = require('../fs');
const getDuplicateDependencies = require('../getDuplicateDependencies');
const getPackageDependencies = require('../getPackageDependencies');
const getDependencyGroupsFromArgv = require('../getDependencyGroupsFromArgv');
const groupYarnDependencies = require('../groupYarnDependencies');
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

const FILE_PREFIX = 'file:';
function normaliseFileDependencies(dependencies, projectPath, packagePath) {
  return Object.keys(dependencies).reduce((acc, key) => {
    let version = dependencies[key];
    if (version.startsWith(FILE_PREFIX)) {
      const absolute = path.resolve(
        projectPath,
        packagePath,
        version.substr(FILE_PREFIX.length)
      );
      const relative = path.relative(projectPath, absolute);
      version = `${FILE_PREFIX}${relative}`;
    }
    acc[key] = version;
    return acc;
  }, {});
}

function readNormalizedPackageJSONSafely(projectPath, packagePath) {
  try {
    const packageJSON = readPackageJSON(path.join(projectPath, packagePath));
    [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ].forEach(key => {
      if (key in packageJSON) {
        packageJSON[key] = normaliseFileDependencies(
          packageJSON[key],
          projectPath,
          packagePath
        );
      }
    });
    return packageJSON;
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

function ocurrsExeclusivelyAsDevDependencies(packageName, packages) {
  let devDependency = false;
  for (const [name, pkg] of packages.entries()) {
    const dependencies = pkg.dependencies || {};
    const optionalDependencies = pkg.optionalDependencies || {};
    const devDependencies = pkg.devDependencies || {};
    if (packageName in dependencies || packageName in optionalDependencies) {
      return false;
    }
    if (packageName in devDependencies) {
      devDependency = true;
    }
  }
  return devDependency;
}

exports.handler = function(argv) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath);
  const lockfile = readYarnLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const { workspaces } = packageJSON;
  if (!workspaces || !Array.isArray(workspaces.packages || workspaces)) {
    throw new InvalidProjectTypeError('Project is not a valid yarn workspace');
  }

  const packages = (workspaces.packages || workspaces)
    .map(pattern => glob.sync(pattern, { cwd: projectPath }))
    .reduce((acc, arr) => acc.concat(arr), ['.'])
    .map(packagePath =>
      readNormalizedPackageJSONSafely(projectPath, packagePath)
    )
    .filter(Boolean)
    .reduce((acc, pkg) => acc.set(pkg.name, pkg), new Map());

  const packageNames = Array.from(packages.keys());
  const allowlist = argv.package
    ? [].concat(argv.package)
    : packageNames.filter(
        name => argv.dev || !ocurrsExeclusivelyAsDevDependencies(name, packages)
      );

  if (argv.package) {
    allowlist.forEach(packageName => {
      if (!packages.has(packageName)) {
        throw new InvalidArgumentError(
          `Invalid --package argument passed; package "${packageName}" does not exist`
        );
      }
    });
  }

  const versions = allowlist
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
        groupYarnDependencies(packageDependencies, lockfile, acc),
      new Map()
    );

  const duplicates = getDuplicateDependencies(versions, argv.filter);

  printResult(duplicates, true);
};
