import { formatCurrency, formatPct, formatWeeks } from '../utils/formatters';

describe('formatCurrency', () => {
  it('formats millions correctly', () => {
    expect(formatCurrency(1000000)).toBe('$1.0M');
    expect(formatCurrency(2500000)).toBe('$2.5M');
    expect(formatCurrency(10000000)).toBe('$10.0M');
  });

  it('formats thousands correctly', () => {
    expect(formatCurrency(1000)).toBe('$1K');
    expect(formatCurrency(50000)).toBe('$50K');
    expect(formatCurrency(999999)).toBe('$1000K');
  });

  it('formats small amounts correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(500)).toBe('$500');
    expect(formatCurrency(999)).toBe('$999');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('$-1K');
    expect(formatCurrency(-500)).toBe('$-500');
  });
});

describe('formatPct', () => {
  it('formats percentages correctly', () => {
    expect(formatPct(0.5)).toBe('50.0%');
    expect(formatPct(0.25)).toBe('25.0%');
    expect(formatPct(1)).toBe('100.0%');
    expect(formatPct(0.333)).toBe('33.3%');
  });
});

describe('formatWeeks', () => {
  it('formats weeks under a year', () => {
    expect(formatWeeks(1)).toBe('1w');
    expect(formatWeeks(26)).toBe('26w');
    expect(formatWeeks(51)).toBe('51w');
  });

  it('formats years correctly', () => {
    expect(formatWeeks(52)).toBe('1y');
    expect(formatWeeks(104)).toBe('2y');
  });

  it('formats years and weeks combined', () => {
    expect(formatWeeks(53)).toBe('1y 1w');
    expect(formatWeeks(78)).toBe('1y 26w');
    expect(formatWeeks(130)).toBe('2y 26w');
  });
});
