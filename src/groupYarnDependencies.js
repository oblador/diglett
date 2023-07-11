const { StaleLockfileError } = require('./errors');
const parseYarnDescriptor = require('./parseYarnDescriptor');

function resolveDependency(packageName, requestedVersion, dependencies) {
  // yarn v1 uses a simple format for the key: `${packageName}@${version}`
  const simpleKey = `${packageName}@${requestedVersion}`;
  if (simpleKey in dependencies) return dependencies[simpleKey];

  for (const [key, value] of Object.entries(dependencies)) {
    // ignore metadata keys
    if (key === '__metadata') continue;

    // yarn v2 uses a more complex format for the key: `${packageName}@${protocol}${version}`
    const { packageName: name, version } = parseYarnDescriptor(key);
    if (name === packageName && version === requestedVersion) {
      return value;
    }
  }

  return null;
}

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
    const resolvedDependency = resolveDependency(
      packageName,
      requestedVersion,
      dependencies
    );

    if (!resolvedDependency) {
      throw new StaleLockfileError(
        `Unable to find resolution for package "${packageName}" and version "${requestedVersion}", ensure yarn.lock is up to date`
      );
    }
    const installedVersion = resolvedDependency.version;

    if (!versions.has(installedVersion)) {
      versions.add(installedVersion);
      const subDependencies = resolvedDependency.dependencies;
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
