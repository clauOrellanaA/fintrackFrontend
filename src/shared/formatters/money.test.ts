import { expect, it } from 'vitest';
import { formatBobMoney } from './money';

it('formats BOB amounts without losing decimal precision', () => {
  expect(formatBobMoney('0.00')).toBe('Bs. 0,00');
  expect(formatBobMoney('2500.05')).toBe('Bs. 2.500,05');
  expect(formatBobMoney('-0.01')).toBe('−Bs. 0,01');
  expect(formatBobMoney('999999999999.99')).toBe('Bs. 999.999.999.999,99');
});

it('rejects a value outside the exact contract representation', () => {
  expect(() => formatBobMoney('2.5')).toThrow('Invalid monetary amount');
});
