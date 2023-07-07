# Diglett

Diglett is a command line tool that helps you detect packages with multiple versions in your JavaScript project. It is particularly useful for frontend apps where you want to keep the bundle size down.

## Usage

By default _diglett_ will ignore packages not imported by dependencies defined in the `dependencies` field of your `package.json`. If duplicate resolved packages found it will exit with code `1` and output the resolved versions:

```
Found 1 duplicate dependency
@material/animation with versions 3.1.0, 4.0.0.
```

### npm projects

```
npx diglett npm <optional path to project>
```

### Yarn projects

```
npx diglett yarn <optional path to project>
```

Supports both yarn v1 and yarn berry.

### Yarn workspaces

```
npx diglett yarn-workspace <optional path to project> [--package <package name>]
```

By default all workspace packages are analyzed. If you just want to analyze one, pass the `--package` option with the package name – not folder name. It's possible to pass the `--package` option multiple times to analyze multiple packages.

Supports both yarn v1 and yarn berry.

## General options

| **Name**           | **Description**                                                | **Default** |
| ------------------ | -------------------------------------------------------------- | ----------- |
| `--filter <regex>` | Ignores packages except those matching the regular expression. | _None_      |
| `--all`            | Checks all packages defined in `package.json`.                 | _false_     |
| `--dev`            | Also checks packages in the `devDependencies` field.           | _false_     |
| `--optional`       | Also checks packages in the `optionalDependencies` field.      | _false_     |
| `--peer`           | Also checks packages in the `peerDependencies` field.          | _false_     |

## Prior work

- [yarn-deduplicate](https://github.com/atlassian/yarn-deduplicate)

## License

Copyright 2020 Joel Arvidsson. MIT licensed, see LICENSE file.
