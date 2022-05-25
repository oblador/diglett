const chalk = require('chalk');

function printResult(duplicates, isYarn = false) {
  if (duplicates.size !== 0) {
    console.error(
      chalk.bold.red(
        `Found ${duplicates.size} duplicate ${
          duplicates.size === 1 ? 'dependency' : 'dependencies'
        }`
      )
    );
    [...duplicates.entries()].sort().forEach(([packageName, versions]) => {
      console.warn(
        `${chalk.bold(packageName)} with versions ${Array.from(versions)
          .sort()
          .join(', ')}.`
      );
    });
    if (isYarn) {
      console.info(
        chalk.dim(
          '\n- Run `yarn why <package>` to find which dependencies mismatch. \n- Consider adding a manual override using the `resolutions` field in your package.json.'
        )
      );
    } else {
      console.info(
        chalk.dim(
          '\n- Run `yarn why <package>` to find which dependencies mismatch. \n- Try `npm dedupe` to fix duplicate dependencies.'
        )
      );
    }
    process.exit(1);
  } else {
    console.info('No duplicate dependencies found');
  }
}

module.exports = printResult;
