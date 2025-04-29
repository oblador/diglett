import path from 'path';
import glob from 'glob';
import { Arguments } from 'yargs';
import { sharedArguments } from '../sharedArguments';
import { InvalidProjectTypeError, InvalidArgumentError } from '../errors';
import { readYarnLockfile, readPackageJSON, PackageJSON } from '../fs';
import { getDuplicateDependencies } from '../getDuplicateDependencies';
import { getPackageDependencies } from '../getPackageDependencies';
import { getDependencyGroupsFromArgv } from '../getDependencyGroupsFromArgv';
import { groupYarnDependencies } from '../groupYarnDependencies';
import { printResult } from '../printResult';

interface YarnWorkspaceArgs extends Arguments {
  projectPath?: string;
  package?: string | string[];
  dev?: boolean;
  filter?: RegExp;
}

export const command = 'yarn-workspace [project-path]';

export const describe = 'Check yarn workspaces project';

export const builder = {
  package: {
    alias: 'scope',
    description: 'workspace package to analyze',
    type: 'string',
  },
  ...sharedArguments,
};

const FILE_PREFIX = 'file:';
function normaliseFileDependencies(
  dependencies: Record<string, string>,
  projectPath: string,
  packagePath: string
): Record<string, string> {
  return Object.keys(dependencies).reduce(
    (acc, key) => {
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
    },
    {} as Record<string, string>
  );
}

function readNormalizedPackageJSONSafely(
  projectPath: string,
  packagePath: string
): PackageJSON | null {
  try {
    const packageJSON = readPackageJSON(
      path.join(projectPath, packagePath)
    ) as PackageJSON;
    const dependencyTypes = [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ] as const;

    dependencyTypes.forEach((key) => {
      if (key in packageJSON) {
        (packageJSON[key] as Record<string, string>) =
          normaliseFileDependencies(
            packageJSON[key] as Record<string, string>,
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

function omit(keysToOmit: string[]) {
  return (object: Record<string, any>) =>
    Object.keys(object)
      .filter((key) => !keysToOmit.includes(key))
      .reduce<Record<string, any>>((acc, key) => {
        acc[key] = object[key];
        return acc;
      }, {});
}

function getWorkspaceDependencies(
  packageName: string,
  packages: Map<string, PackageJSON>,
  accumulatedPackageNames = new Set<string>()
): Set<string> {
  const pkg = packages.get(packageName);
  if (!pkg) return accumulatedPackageNames;

  const dependencies = pkg.dependencies || {};

  return Object.keys(dependencies)
    .filter((key) => packages.has(key))
    .reduce<Set<string>>((acc, key) => {
      if (!acc.has(key)) {
        acc.add(key);
        return getWorkspaceDependencies(key, packages, acc);
      }
      return acc;
    }, accumulatedPackageNames);
}

function occursExclusivelyAsDevDependencies(
  packageName: string,
  packages: Map<string, PackageJSON>
): boolean {
  let devDependency = false;
  for (const [, pkg] of packages.entries()) {
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

export const handler = function (argv: YarnWorkspaceArgs) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath) as PackageJSON;
  const lockfile = readYarnLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const { workspaces } = packageJSON;
  if (!workspaces) {
    throw new InvalidProjectTypeError('Project is not a valid yarn workspace');
  }

  const workspacePatterns = Array.isArray(workspaces)
    ? workspaces
    : workspaces.packages;
  if (!Array.isArray(workspacePatterns)) {
    throw new InvalidProjectTypeError('Project is not a valid yarn workspace');
  }

  const packages = workspacePatterns
    .map((pattern: string) => glob.sync(pattern, { cwd: projectPath }))
    .reduce((acc: string[], arr: string[]) => acc.concat(arr), ['.'])
    .map((packagePath: string) =>
      readNormalizedPackageJSONSafely(projectPath, packagePath)
    )
    .filter((pkg): pkg is PackageJSON => pkg !== null)
    .reduce(
      (acc: Map<string, PackageJSON>, pkg: PackageJSON) =>
        acc.set(pkg.name, pkg),
      new Map()
    );

  const packageNames = Array.from(packages.keys());
  const allowlist = argv.package
    ? Array.isArray(argv.package)
      ? argv.package
      : [argv.package]
    : packageNames.filter(
        (name) =>
          argv.dev || !occursExclusivelyAsDevDependencies(name, packages)
      );

  if (argv.package) {
    allowlist.forEach((packageName) => {
      if (!packages.has(packageName)) {
        throw new InvalidArgumentError(
          `Invalid --package argument passed; package "${packageName}" does not exist`
        );
      }
    });
  }

  const versions = Array.from(
    allowlist.reduce<Set<string>>(
      (acc, packageName) =>
        getWorkspaceDependencies(packageName, packages, acc),
      new Set<string>()
    )
  )
    .map((packageName) => getPackageDependencies(packages.get(packageName)!))
    .concat(
      allowlist.map((packageName) => [
        getPackageDependencies(packages.get(packageName)!, dependencyGroups),
      ])
    )
    .reduce(
      (acc: any[], arr: any[]) => Array.from(new Set(acc.concat(arr))),
      []
    )
    .map(omit(packageNames))
    .reduce(
      (
        acc: Map<string, Set<string>>,
        packageDependencies: Record<string, string>
      ) => groupYarnDependencies(packageDependencies, lockfile, acc),
      new Map()
    );

  const duplicates = getDuplicateDependencies(versions, argv.filter);

  printResult(duplicates, true);
};
