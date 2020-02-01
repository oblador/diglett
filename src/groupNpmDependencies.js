const buildNpmLockfileGraph = require('./graph/buildNpmLockfileGraph');

const populateVersions = (dependency, installedVersions = new Map()) => {
  if (!installedVersions.has(dependency.name)) {
    installedVersions.set(dependency.name, new Set());
  }

  const versions = installedVersions.get(dependency.name);

  if (!versions.has(dependency.version)) {
    versions.add(dependency.version);
    dependency.children.forEach(child => {
      populateVersions(child, installedVersions);
    });
  }

  return installedVersions;
};

function groupNpmDependencies(packageDependencies, lockfile) {
  const graph = buildNpmLockfileGraph(lockfile);

  const versions = new Map();

  for (const packageName in packageDependencies) {
    const dependency = graph.children.get(packageName);
    populateVersions(dependency, versions);
  }

  return versions;
}

module.exports = groupNpmDependencies;
