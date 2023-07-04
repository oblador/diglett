/**
 * A regular expression for parsing a yarn berry descriptor.
 */
const PARSE_REGEX = /(^@?[^/]+?\/?[^@/]+?)@(?:.*:)*(.+)/;

/**
 * @typedef {Object} ParsedDescriptor
 * @property {string} packageName
 * @property {string} version
 */

/**
 * Parses a yarn berry descriptor into an object.
 *
 * For example `@material/ripple@npm:1.0.0` will be parsed to:
 * ```
 * {
 *  package: '@material/ripple',
 *  version: '1.0.0',
 * }
 * ```
 *
 * Supported formats:
 * - `package@version`
 * - `@scope/package@version`
 * - `package@protocol:version`
 * - `@scope/package@protocol:version`
 *
 * @param {string} descriptor - The yarn berry descriptor to parse.
 * @returns {ParsedDescriptor} The parsed descriptor.
 */
function parseYarnDescriptor(descriptor) {
  const result = PARSE_REGEX.exec(descriptor);
  if (!result) {
    throw new Error(`Unable to parse descriptor: ${descriptor}`);
  }
  const [, packageName, version] = result;
  return { packageName, version };
}

module.exports = parseYarnDescriptor;
