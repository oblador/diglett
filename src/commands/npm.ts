import path from 'path';
import { Arguments } from 'yargs';
import { sharedArguments } from '../sharedArguments';
import { readNpmLockfile, readPackageJSON } from '../fs';
import { groupNpmDependencies } from '../groupNpmDependencies';
import { getDuplicateDependencies } from '../getDuplicateDependencies';
import { getPackageDependencies } from '../getPackageDependencies';
import { getDependencyGroupsFromArgv } from '../getDependencyGroupsFromArgv';
import { printResult } from '../printResult';

interface NpmArgs extends Arguments {
  projectPath?: string;
  filter?: RegExp | undefined;
}

export const command = 'npm [project-path]';

export const describe = 'Check npm project';

export const builder = {
  ...sharedArguments,
};

export const handler = function (argv: NpmArgs) {
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
