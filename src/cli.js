const yargs = require('yargs');
const chalk = require('chalk');
const { DiglettError } = require('./errors');
const { name, version } = require('../package.json');

function main() {
  console.info(chalk.bold(`${name} v${version}`));

  try {
    yargs
      .commandDir('commands')
      .demandCommand(1, 'You must provide a command')
      .recommendCommands()
      .strict()
      .help().argv;
  } catch (error) {
    if (error instanceof DiglettError) {
      console.error(chalk.red(error.message));
      process.exit(1);
    } else {
      throw error;
    }
  }
}

module.exports = main;
