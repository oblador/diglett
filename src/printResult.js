const chalk = require('chalk');

function printResult(duplicates) {
  if (duplicates.size !== 0) {
    console.error(
      chalk.bold.red(
        `Found ${duplicates.size} duplicate ${
          duplicates.size === 1 ? 'dependency' : 'dependencies'
        }`
      )
    );
    duplicates.forEach((versions, packageName) => {
      console.warn(
        `${chalk.bold(packageName)} with versions ${Array.from(versions).join(
          ', '
        )}.`
      );
    });
    console.info(
      chalk.dim(
        '\n- Run `yarn why <package>` to find which dependencies mismatch. \n- Consider adding a manual override using the `resolutions` field in your package.json.'
      )
    );
    process.exit(1);
  } else {
    console.info('No duplicate dependencies found');
  }
}

module.exports = printResult;
