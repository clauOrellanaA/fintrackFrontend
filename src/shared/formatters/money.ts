const MONEY = /^(-?)(\d+)\.(\d{2})$/;

/** Formats contract money exactly; it never converts a decimal amount to Number. */
export function formatBobMoney(amount: string): string {
  const match = MONEY.exec(amount);
  if (!match) throw new Error('Invalid monetary amount');

  const [, negative, integer, fraction] = match;
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '−' : ''}Bs. ${groupedInteger},${fraction}`;
}
