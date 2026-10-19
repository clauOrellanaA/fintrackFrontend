import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BalanceCard } from './BalanceCard';

it('renders the backend balance exactly, including a negative amount and explicit cutoff', () => {
  render(<BalanceCard balance={{ status: 'ready', data: { amount: '-999999999999.99', cutoff: '2026-10-19T12:00:00.000Z' } }} />);

  expect(screen.getByRole('heading', { name: 'Saldo disponible' })).toBeVisible();
  expect(screen.getByText('−Bs. 999.999.999.999,99')).toBeVisible();
  expect(screen.getByText(/Corte:/)).toHaveTextContent('Bolivia');
});

it('does not turn an unavailable balance into zero', () => {
  render(<BalanceCard balance={{ status: 'notAvailable' }} />);

  expect(screen.getByText('El saldo aún no está disponible para esta consulta.')).toBeVisible();
  expect(screen.queryByText('Bs. 0,00')).not.toBeInTheDocument();
});
