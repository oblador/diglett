const groupYarnDependencies = require('./groupYarnDependencies');

function getDuplicateDependencies(groupedVersions, packageNamePattern) {
  const duplicates = new Map();
  groupedVersions.forEach((versions, packageName) => {
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
