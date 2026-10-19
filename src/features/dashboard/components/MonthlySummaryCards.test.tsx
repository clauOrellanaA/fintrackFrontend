import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MonthlySummaryCards } from './MonthlySummaryCards';

it('renders gross monthly income and expense from the contract without a net result', () => {
  render(<MonthlySummaryCards month="2026-10" summary={{ status: 'ready', data: { income: '999999999999.99', expense: '500.05' } }} />);

  expect(screen.getByRole('heading', { name: 'Ingresos del mes' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Gastos del mes' })).toBeVisible();
  expect(screen.getByText('Bs. 999.999.999.999,99')).toBeVisible();
  expect(screen.getByText('Bs. 500,05')).toBeVisible();
  expect(screen.getAllByText('octubre de 2026')).toHaveLength(2);
  expect(screen.queryByText(/Resultado neto/)).not.toBeInTheDocument();
});

it('shows a real empty month as zero and preserves an unavailable section', () => {
  const { rerender } = render(<MonthlySummaryCards month="2026-10" summary={{ status: 'ready', data: { income: '0.00', expense: '0.00' } }} />);
  expect(screen.getAllByText('Bs. 0,00')).toHaveLength(2);
  expect(screen.getAllByText('Sin movimientos en octubre de 2026')).toHaveLength(2);

  rerender(<MonthlySummaryCards month="2026-10" summary={{ status: 'notAvailable' }} />);
  expect(screen.getByText('Los ingresos y gastos aún no están disponibles para esta consulta.')).toBeVisible();
  expect(screen.queryByText('Bs. 0,00')).not.toBeInTheDocument();
});
