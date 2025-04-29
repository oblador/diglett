const fs = require('fs');
const path = require('path');
const { parseSyml } = require('@yarnpkg/parsers');
const { FileNotFoundError, ParseError } = require('./errors');

function readFile(fileName: string, projectPath: string) {
  const filePath = path.join(projectPath, fileName);
  if (!fs.existsSync(filePath)) {
    throw new FileNotFoundError(`File ${fileName} not found in ${projectPath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readJSON(fileName: string, projectPath: string) {
  const file = readFile(fileName, projectPath);
  try {
    return JSON.parse(file);
  } catch {
    throw new ParseError(`Failed to parse ${fileName}`);
  }
}

export function readYarnLockfile(projectPath: string) {
  const file = readFile('yarn.lock', projectPath);

  try {
    return parseSyml(file);
  } catch {
    throw new ParseError('Failed to parse yarn.lock');
  }
}

export interface PackageJSON {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export function readPackageJSON(projectPath: string): PackageJSON {
  return readJSON('package.json', projectPath);
}

export function readNpmLockfile(projectPath: string) {
  return readJSON('package-lock.json', projectPath);
}
