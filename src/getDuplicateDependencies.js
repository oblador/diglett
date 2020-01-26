const groupResolvedDependencies = require('./groupResolvedDependencies');

function getDuplicateDependencies(
  resolvedDependencies,
  packageDependencies,
  packageNamePattern
) {
  const grouped = groupResolvedDependencies(
    packageDependencies,
    resolvedDependencies
  );

  const duplicates = new Map();
  grouped.forEach((versions, packageName) => {
    if (
      versions.size > 1 &&
      (!packageNamePattern || packageNamePattern.test(packageName))
    ) {
      duplicates.set(packageName, versions);
    }
  });

  return duplicates;
}

module.exports = getDuplicateDependencies;
