const { StaleLockfileError } = require('./errors');

function groupYarnDependencies(
  packageDependencies,
  resolvedDependencies,
  collection
) {
  const populateVersions = (
    packageName,
    requestedVersion,
    dependencies,
    installedVersions = new Map()
  ) => {
    if (!installedVersions.has(packageName)) {
      installedVersions.set(packageName, new Set());
    }

    const versions = installedVersions.get(packageName);
    const dependencyKey = `${packageName}@${requestedVersion}`;
    const resolvedDependency = dependencies[dependencyKey];
    if (!resolvedDependency) {
      throw new StaleLockfileError(
        `Unable to find resolution for "${dependencyKey}", ensure yarn.lock is up to date`
      );
    }
    const installedVersion = resolvedDependency.version;

    if (!versions.has(installedVersion)) {
      versions.add(installedVersion);
      const subDependencies = dependencies[dependencyKey].dependencies;
      for (const subDependency in subDependencies) {
        populateVersions(
          subDependency,
          subDependencies[subDependency],
          resolvedDependencies,
          installedVersions
        );
      }
    }

    return installedVersions;
  };

  const versions = collection ? new Map(collection) : new Map();

  for (const packageName in packageDependencies) {
    const requestedVersion = packageDependencies[packageName];
    populateVersions(
      packageName,
      requestedVersion,
      resolvedDependencies,
      versions
    );
  }

  return versions;
}

module.exports = groupYarnDependencies;
