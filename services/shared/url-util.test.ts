import { getPortFromUrl } from './url-util';

describe('getPortFromUrl', () => {
  it('should return the correct port for a standard URL', () => {
    expect(getPortFromUrl('http://localhost:3000')).toBe(3000);
    expect(getPortFromUrl('https://example.com:443')).toBe(443);
    expect(getPortFromUrl('ftp://host:21')).toBe(21);
  });

  it('should return default ports if no port is specified', () => {
    expect(getPortFromUrl('http://localhost')).toBe(80);
    expect(getPortFromUrl('https://example.com')).toBe(443);
    expect(getPortFromUrl('ftp://host')).toBe(21);
    expect(getPortFromUrl('custom://host')).toBeNaN();
  });

  it('should throw for invalid URLs', () => {
    expect(() => getPortFromUrl('not-a-url')).toThrow();
  });
});
