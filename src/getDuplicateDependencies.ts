export function getDuplicateDependencies(
  groupedVersions: Map<string, Set<string>>,
  packageNamePattern?: RegExp
) {
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
