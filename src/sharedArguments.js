module.exports = {
  filter: {
    default: undefined,
    description: 'filter packages by regular expression',
    coerce: value => value && new RegExp(value),
  },
  all: {
    alias: 'allDependencies',
    default: false,
    description: 'include all package dependencies',
    type: 'boolean',
  },
  dev: {
    alias: 'devDependencies',
    default: false,
    description: 'include packages in devDependencies',
    type: 'boolean',
  },
  optional: {
    alias: 'optionalDependencies',
    default: false,
    description: 'include packages in optionalDependencies',
    type: 'boolean',
  },
  peer: {
    alias: 'peerDependencies',
    default: false,
    description: 'include packages in peerDependencies',
    type: 'boolean',
  },
};
