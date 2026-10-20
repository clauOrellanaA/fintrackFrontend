import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BudgetIndicators } from './BudgetIndicators';

it('represents backend states and progress at 80, 100 and above 100 percent', () => {
  render(<BudgetIndicators month="2026-10" budgets={{ status: 'ready', data: [
    { id: '11111111-1111-4111-8111-111111111111', categoryId: '11111111-1111-4111-8111-111111111111', categoryName: 'Alimentación', limit: '100.00', spent: '80.00', remaining: '20.00', progress: '80.00', state: 'warning' },
    { id: '22222222-2222-4222-8222-222222222222', categoryId: '22222222-2222-4222-8222-222222222222', categoryName: 'Transporte', limit: '100.00', spent: '100.00', remaining: '0.00', progress: '100.00', state: 'warning' },
    { id: '33333333-3333-4333-8333-333333333333', categoryId: '33333333-3333-4333-8333-333333333333', categoryName: 'Compras', limit: '100.00', spent: '100.01', remaining: '-0.01', progress: '100.01', state: 'exceeded' },
  ] }} />);

  expect(screen.getAllByText('Atención')).toHaveLength(2);
  expect(screen.getByText('Excedido')).toBeVisible();
  expect(screen.getByText('−Bs. 0,01')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Progreso de Compras: Excedido, 100,01 %' })).toBeVisible();
});

it('distinguishes no budgets from an unavailable budgets section', () => {
  const { rerender } = render(<BudgetIndicators month="2026-10" budgets={{ status: 'ready', data: [] }} />);
  expect(screen.getByText('Sin presupuestos para este período')).toBeVisible();
  expect(screen.getByText('No hay presupuestos configurados en octubre de 2026.')).toBeVisible();

  rerender(<BudgetIndicators month="2026-10" budgets={{ status: 'notAvailable' }} />);
  expect(screen.getByText('Este detalle aún no está disponible para la consulta.')).toBeVisible();
  expect(screen.queryByText('Sin presupuestos para este período')).not.toBeInTheDocument();
});
