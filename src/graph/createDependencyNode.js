module.exports = function createDependencyNode(
  name,
  version,
  parent = null,
  children = new Map()
) {
  return { name, version, parent, children };
};
