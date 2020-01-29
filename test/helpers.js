const path = require('path');
const child_process = require('child_process');

const DIGLETT_PATH = path.join(path.dirname(__dirname), 'bin', 'diglett');

const exec = (args = []) =>
  new Promise(resolve => {
    child_process.exec(
      `${DIGLETT_PATH} ${args.join(' ')}`,
      (err, stdout, stderr) => {
        resolve({ stdout, stderr });
      }
    );
  });

module.exports = {
  exec,
};
