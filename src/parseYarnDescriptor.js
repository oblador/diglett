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
 * Parses a yarn descriptor into an object.
 * Handles both yarn v1 and yarn berry descriptors.
 *
 * Supported formats:
 * - "package@version"
 * - "@scope/package@version"
 * - "package@protocol:version"
 * - "@scope/package@protocol:version"
 *
 * Examples:
 * - yarn v1: "@material/ripple@1.0.0"
 * - yarn berry: "@material/ripple@npm:1.0.0"
 *
 * Both will be parsed to:
 * ```
 * {
 *  package: '@material/ripple',
 *  version: '1.0.0',
 * }
 * ```
 *
 * @param {string} descriptor - The yarn descriptor to parse.
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
