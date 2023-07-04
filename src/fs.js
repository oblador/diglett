const fs = require('fs');
const path = require('path');
const lockfile = require('@yarnpkg/lockfile');
const yml = require('js-yaml');
const { FileNotFoundError, ParseError } = require('./errors');

function readFile(fileName, projectPath) {
  const filePath = path.join(projectPath, fileName);
  if (!fs.existsSync(filePath)) {
    throw new FileNotFoundError(`File ${fileName} not found in ${projectPath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readJSON(fileName, projectPath) {
  const file = readFile(fileName, projectPath);
  try {
    return JSON.parse(file);
  } catch {
    throw new ParseError(`Failed to parse ${fileName}`);
  }
}

function readYarnLockfile(projectPath) {
  const file = readFile('yarn.lock', projectPath);

  try {
    const parsed = lockfile.parse(file);
    if (parsed.type !== 'success') {
      throw new ParseError('Failed to parse yarn.lock');
    }
    return parsed.object;
  } catch {
    try {
      const parsed = yml.load(file);
      return parsed;
    } catch (error) {
      throw new ParseError('Failed to parse yarn.lock');
    }
  }
}

function readPackageJSON(projectPath) {
  return readJSON('package.json', projectPath);
}

function readNpmLockfile(projectPath) {
  return readJSON('package-lock.json', projectPath);
}

module.exports = {
  readYarnLockfile,
  readNpmLockfile,
  readPackageJSON,
};
