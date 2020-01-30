function getPackageDependencies(
  packageJSON,
  dependencyGroups = ['dependencies']
) {
  return dependencyGroups
    .map(dependencyGroup => packageJSON[dependencyGroup])
    .filter(Boolean)
    .reduce((acc, current) => Object.assign(acc, current), {});
}

module.exports = getPackageDependencies;
