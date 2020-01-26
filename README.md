# Diglett

Diglett is a command line tool that helps you detect packages with multiple versions in your JavaScript project. It is particularly useful for frontend apps where you want to keep the bundle size down.

## Usage

```
npx diglett <optional path to project>
```

By default _diglett_ will ignore packages not imported by dependencies defined in the `dependencies` field of your `package.json`. If duplicate resolved packages found it will exit with code `1` and output the resolved versions:

```
Found 1 duplicate dependency
@material/animation with versions 3.1.0, 4.0.0.
```

## Options

| **Name**           | **Description**                                                | **Default** |
| ------------------ | -------------------------------------------------------------- | ----------- |
| `--filter <regex>` | Ignores packages except those matching the regular expression. | _None_      |
| `--all`            | Checks all packages defined in `package.json`.                 | _false_     |
| `--dev`            | Also checks packages in the `devDependencies` field.           | _false_     |
| `--optional`       | Also checks packages in the `optionalDependencies` field.      | _false_     |
| `--peer`           | Also checks packages in the `peerDependencies` field.          | _false_     |

## Limitations

Currently the project only supports projects with `yarn.lock` files.

## Prior work

- [yarn-deduplicate](https://github.com/atlassian/yarn-deduplicate)

## License

Copyright 2020 Joel Arvidsson. MIT licensed, see LICENSE file.
