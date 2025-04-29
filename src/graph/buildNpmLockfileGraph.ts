import { createDependencyNode } from './createDependencyNode';
import type { DependencyNode } from './createDependencyNode';

function findDependency(
  name: string,
  node: DependencyNode | null
): DependencyNode | null {
  if (node) {
    const child = node.children.get(name);
    if (child) {
      return child;
    }
    return findDependency(name, node.parent);
  }
  return null;
}

function resolveAndPopulateRequires(
  node: DependencyNode,
  requires: Record<string, string>
) {
  if (requires) {
    for (const name in requires) {
      const dependencyNode = findDependency(name, node);
      if (!dependencyNode) {
        throw new Error(`Dependency ${name} not found`);
      }
      node.children.set(name, dependencyNode);
    }
  }
  return node;
}

function populateDependencyNodes(
  node: DependencyNode,
  dependencies: Record<string, any>
) {
  for (const name in dependencies) {
    const dependency = dependencies[name];
    const child = createDependencyNode(name, dependency.version, node);
    node.children.set(name, child);
    if (dependency.dependencies) {
      populateDependencyNodes(child, dependency.dependencies);
    }
  }
  return node;
}

function populateRequireNodes(
  node: DependencyNode,
  dependency: Record<string, any>
) {
  node.children.forEach((child, name) => {
    populateRequireNodes(child, dependency.dependencies[name]);
  });
  resolveAndPopulateRequires(node, dependency.requires);

  return node;
}

export function buildNpmLockfileGraph(lockfile: Record<string, any>) {
  const node = createDependencyNode(lockfile.name, lockfile.version);
  const { dependencies } = lockfile;
  populateDependencyNodes(node, dependencies);
  for (const name in dependencies) {
    const child = node.children.get(name);
    if (child) {
      populateRequireNodes(child, dependencies[name]);
    } else {
      throw new Error(`Dependency ${name} not found`);
    }
  }
  return node;
}
