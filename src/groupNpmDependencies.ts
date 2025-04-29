import { StaleLockfileError } from './errors';
import { buildNpmLockfileGraph } from './graph/buildNpmLockfileGraph';
import { DependencyNode } from './graph/createDependencyNode';

function populateVersions(
  dependency: DependencyNode,
  installedVersions = new Map()
) {
  if (!installedVersions.has(dependency.name)) {
    installedVersions.set(dependency.name, new Set());
  }

  const versions = installedVersions.get(dependency.name);

  if (!versions.has(dependency.version)) {
    versions.add(dependency.version);
    dependency.children.forEach((child) => {
      populateVersions(child, installedVersions);
    });
  }

  return installedVersions;
}

export function groupNpmDependencies(
  packageDependencies: Record<string, any>,
  lockfile: Record<string, any>
) {
  const graph = buildNpmLockfileGraph(lockfile);

  const versions = new Map();

  for (const packageName in packageDependencies) {
    const dependency = graph.children.get(packageName);
    if (!dependency) {
      throw new StaleLockfileError(
        `Unable to find resolution for "${packageName}", ensure package-lock.json is up to date`
      );
    }
    populateVersions(dependency, versions);
  }

  return versions;
}
