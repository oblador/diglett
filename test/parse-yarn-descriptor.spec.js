const parseYarnDescriptor = require('../src/parseYarnDescriptor');

describe('parse-yarn-descriptor', () => {
  it('should parse a yarn v1 descriptor', () => {
    expect(parseYarnDescriptor('hest@1.0.0')).toEqual({
      packageName: 'hest',
      version: '1.0.0',
    });
  });

  it('should parse a yarn berry descriptor with protocol', () => {
    expect(parseYarnDescriptor('hest@npm:1.0.0')).toEqual({
      packageName: 'hest',
      version: '1.0.0',
    });
  });

  it('should parse a yarn berry descriptor with scope', () => {
    expect(parseYarnDescriptor('@snel/hest@1.0.0')).toEqual({
      packageName: '@snel/hest',
      version: '1.0.0',
    });
  });

  it('should parse a yarn berry descriptor with scope and protocol', () => {
    expect(parseYarnDescriptor('@snel/hest@npm:1.0.0')).toEqual({
      packageName: '@snel/hest',
      version: '1.0.0',
    });
  });

  it('should parse a single char yarn berry descriptor with protocol', () => {
    expect(parseYarnDescriptor('q@npm:1.0.0')).toEqual({
      packageName: 'q',
      version: '1.0.0',
    });
  });

  it('should throw an error if the descriptor is invalid', () => {
    expect(() => parseYarnDescriptor('invalid')).toThrow();
  });

  it('should throw an error if the descriptor is undefined', () => {
    expect(() => parseYarnDescriptor()).toThrow();
  });
});
