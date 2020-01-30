function getDependencyGroupsFromArgv(argv) {
  return ['devDependencies', 'optionalDependencies', 'peerDependencies']
    .filter(dependencyGroup => argv.allDependencies || argv[dependencyGroup])
    .concat('dependencies');
}

module.exports = getDependencyGroupsFromArgv;
