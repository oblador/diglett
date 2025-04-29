import path from 'path';
import { exec as childProcessExec } from 'child_process';

const DIGLETT_PATH = path.join(__dirname, '..', 'bin', 'diglett');

interface ExecResult {
  stdout: string;
  stderr: string;
}

export const exec = (args: string[] = []): Promise<ExecResult> =>
  new Promise((resolve) => {
    childProcessExec(
      `${DIGLETT_PATH} ${args.join(' ')}`,
      (err, stdout, stderr) => {
        resolve({ stdout, stderr });
      }
    );
  });

export const getFixturePath = (fixtureName: string): string =>
  `${__dirname}/fixtures/${fixtureName}`;
