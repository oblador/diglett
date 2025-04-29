/**
 * Represents a dependency node in the dependency graph.
 */
export interface DependencyNode {
  name: string;
  version: string;
  parent: DependencyNode | null;
  children: Map<string, DependencyNode>;
}

export function createDependencyNode(
  name: string,
  version: string,
  parent: DependencyNode | null = null,
  children: Map<string, DependencyNode> = new Map()
): DependencyNode {
  return { name, version, parent, children };
}
