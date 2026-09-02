import { parseLocalDate } from './parse-local-date';

// REGRESSION: new Date('YYYY-MM-DD') is parsed as UTC midnight -- in Peru (GMT-5) that
// displays as the previous day. parseLocalDate must parse as LOCAL midnight instead.

describe('parseLocalDate', () => {
  it('parses a YYYY-MM-DD string as local midnight, not UTC midnight', () => {
    const result = parseLocalDate('2026-08-01');

    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(7); // 0-indexed: August
    expect(result?.getDate()).toBe(1);
  });

  it('strips a time component if present', () => {
    const result = parseLocalDate('2026-08-01T15:30:00.000Z');

    expect(result?.getDate()).toBe(1);
  });

  it('returns null for null/undefined/empty input', () => {
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
    expect(parseLocalDate('')).toBeNull();
  });

  it('returns null for a malformed date string', () => {
    expect(parseLocalDate('not-a-date')).toBeNull();
    expect(parseLocalDate('2026/08/01')).toBeNull();
  });
});
