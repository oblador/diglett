const fs = require('fs');
const path = require('path');
const lockfile = require('@yarnpkg/lockfile');
const { FileNotFoundError, ParseError } = require('./errors');

function readFile(fileName, projectPath) {
  const filePath = path.join(projectPath, fileName);
  if (!fs.existsSync(filePath)) {
    throw new FileNotFoundError(
      `File ${fileName} not found in ${projectPath}. Please supply a valid path to a yarn project.`
    );
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readLockfile(projectPath) {
  const file = readFile('yarn.lock', projectPath);
  const parsed = lockfile.parse(file);
  if (parsed.type !== 'success') {
    throw new ParseError('Failed to parse yarn.lock');
  }
  return parsed.object;
}

function readPackageJSON(projectPath) {
  const file = readFile('package.json', projectPath);
  try {
    return JSON.parse(file);
  } catch {
    throw new ParseError('Failed to parse package.json');
  }
}

module.exports = {
  readLockfile,
  readPackageJSON,
};
