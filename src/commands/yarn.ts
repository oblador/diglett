import path from 'path';
import { Arguments } from 'yargs';
import { sharedArguments } from '../sharedArguments';
import { readYarnLockfile, readPackageJSON, PackageJSON } from '../fs';
import { groupYarnDependencies } from '../groupYarnDependencies';
import { getDuplicateDependencies } from '../getDuplicateDependencies';
import { getPackageDependencies } from '../getPackageDependencies';
import { getDependencyGroupsFromArgv } from '../getDependencyGroupsFromArgv';
import { printResult } from '../printResult';

interface YarnArgs extends Arguments {
  projectPath?: string;
  filter?: RegExp;
}

export const command = 'yarn [project-path]';

export const describe = 'Check regular yarn project';

export const builder = {
  ...sharedArguments,
};

export const handler = function (argv: YarnArgs) {
  const projectPath = path.resolve(argv.projectPath || './');
  const packageJSON = readPackageJSON(projectPath) as PackageJSON;
  const lockfile = readYarnLockfile(projectPath);
  const dependencyGroups = getDependencyGroupsFromArgv(argv);

  const packageDependencies = getPackageDependencies(
    packageJSON,
    dependencyGroups
  );

  const groupedVersions = groupYarnDependencies(
    packageDependencies,
    lockfile,
    new Map()
  );

  const duplicates = getDuplicateDependencies(groupedVersions, argv.filter);

  printResult(duplicates, true);
};
