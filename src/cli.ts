import yargs from 'yargs';
import chalk from 'chalk';
import { DiglettError } from './errors';
import { name, version } from '../package.json';

function main(): void {
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

export default main;
