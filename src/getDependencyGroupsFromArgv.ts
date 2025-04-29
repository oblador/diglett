export function getDependencyGroupsFromArgv(argv: Record<string, any>) {
  return ['devDependencies', 'optionalDependencies', 'peerDependencies']
    .filter((dependencyGroup) => argv.allDependencies || argv[dependencyGroup])
    .concat('dependencies');
}
