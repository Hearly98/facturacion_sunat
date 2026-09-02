import { CurrencyPipe } from './currency.pipe';

// REGRESSION: templates hardcoded 'S/. ' regardless of the real Moneda.simbolo, so a
// USD sale/quotation/purchase displayed with the Soles symbol. This pipe must use the
// real symbol passed in, only falling back to 'S/' when none is available.

describe('CurrencyPipe', () => {
  let pipe: CurrencyPipe;

  beforeEach(() => {
    pipe = new CurrencyPipe();
  });

  it('formats with the real currency symbol passed in', () => {
    expect(pipe.transform(1234.5, '$')).toBe('$ 1,234.50');
  });

  it('falls back to Soles when no symbol is provided', () => {
    expect(pipe.transform(1234.5)).toBe('S/ 1,234.50');
    expect(pipe.transform(1234.5, null)).toBe('S/ 1,234.50');
  });

  it('treats null/undefined values as zero', () => {
    expect(pipe.transform(null, 'S/')).toBe('S/ 0.00');
    expect(pipe.transform(undefined, 'S/')).toBe('S/ 0.00');
  });

  it('always shows exactly two decimals', () => {
    expect(pipe.transform(5, 'S/')).toBe('S/ 5.00');
    expect(pipe.transform(5.1, 'S/')).toBe('S/ 5.10');
  });
});
