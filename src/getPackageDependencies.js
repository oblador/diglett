function getPackageDependencies(packageJSON, argv) {
  return ['devDependencies', 'optionalDependencies', 'peerDependencies']
    .filter(dependencyGroup => argv.allDependencies || argv[dependencyGroup])
    .concat('dependencies')
    .map(dependencyGroup => packageJSON[dependencyGroup])
    .filter(Boolean)
    .reduce((acc, current) => Object.assign(acc, current), {});
}

module.exports = getPackageDependencies;
