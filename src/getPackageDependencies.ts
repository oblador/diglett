export function getPackageDependencies(
  packageJSON: Record<string, any>,
  dependencyGroups = ['dependencies']
) {
  return dependencyGroups
    .map((dependencyGroup) => packageJSON[dependencyGroup])
    .filter(Boolean)
    .reduce((acc, current) => Object.assign(acc, current), {});
}
