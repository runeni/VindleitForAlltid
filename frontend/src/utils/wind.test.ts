import { describe, it, expect } from 'vitest';
import { getWindLevel, windLevelBg, windLevelBorder } from './wind';

describe('getWindLevel', () => {
  it('returns very-light for speed below 5', () => {
    expect(getWindLevel(0)).toBe('very-light');
    expect(getWindLevel(4.9)).toBe('very-light');
    expect(getWindLevel(1)).toBe('very-light');
  });

  it('returns very-light for speed of exactly 0', () => {
    expect(getWindLevel(0)).toBe('very-light');
  });

  it('returns light for speed of exactly 5', () => {
    expect(getWindLevel(5)).toBe('light');
  });

  it('returns light for speed of 6', () => {
    expect(getWindLevel(6)).toBe('light');
  });

  it('does not return light for speed of exactly 7', () => {
    expect(getWindLevel(7)).not.toBe('light');
  });

  it('returns good for speed of 7', () => {
    expect(getWindLevel(7)).toBe('good');
  });

  it('returns none for null', () => {
    expect(getWindLevel(null)).toBe('none');
  });

  it('returns none for undefined', () => {
    expect(getWindLevel(undefined)).toBe('none');
  });
});

describe('windLevelBg', () => {
  it('returns grey/slate classes for very-light', () => {
    const result = windLevelBg('very-light');
    expect(result).toMatch(/slate/);
  });

  it('returns blue classes for light', () => {
    const result = windLevelBg('light');
    expect(result).toMatch(/blue/);
  });
});

describe('windLevelBorder', () => {
  it('returns slate border for very-light', () => {
    const result = windLevelBorder('very-light');
    expect(result).toMatch(/slate/);
  });

  it('returns blue border for light', () => {
    const result = windLevelBorder('light');
    expect(result).toMatch(/blue/);
  });
});
