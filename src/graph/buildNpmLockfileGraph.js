const createDependencyNode = require('./createDependencyNode');

const findDependency = (name, node) => {
  if (node) {
    if (node.children.has(name)) {
      return node.children.get(name);
    }
    return findDependency(name, node.parent);
  }
  return null;
};

const resolveAndPopulateRequires = (node, requires) => {
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
};

const populateDependencyNodes = (node, dependencies) => {
  for (const name in dependencies) {
    const dependency = dependencies[name];
    const child = createDependencyNode(name, dependency.version, node);
    node.children.set(name, child);
    if (dependency.dependencies) {
      populateDependencyNodes(child, dependency.dependencies);
    }
  }
  return node;
};

const populateRequireNodes = (node, dependency) => {
  node.children.forEach((child, name) => {
    populateRequireNodes(child, dependency.dependencies[name]);
  });
  resolveAndPopulateRequires(node, dependency.requires);

  return node;
};

const buildNpmLockfileGraph = lockfile => {
  const node = createDependencyNode(lockfile.name);
  const { dependencies } = lockfile;
  populateDependencyNodes(node, dependencies);
  for (const name in dependencies) {
    const child = node.children.get(name);
    populateRequireNodes(child, dependencies[name]);
  }
  return node;
};

module.exports = buildNpmLockfileGraph;
