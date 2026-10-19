import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ExpenseDistribution } from './ExpenseDistribution';

it('renders the exact expense distribution with its textual alternative', () => {
  render(<ExpenseDistribution month="2026-10" distribution={{ status: 'ready', data: [
    { categoryId: '11111111-1111-4111-8111-111111111111', categoryName: 'Alimentación y compras con nombre largo', amount: '500.05', percentage: '35.72' },
    { categoryId: null, categoryName: 'Sin categoría', amount: '900.00', percentage: '64.28' },
  ] }} />);

  expect(screen.getByRole('heading', { name: 'Distribución de gastos' })).toBeVisible();
  expect(screen.getByText('Alimentación y compras con nombre largo')).toBeVisible();
  expect(screen.getByText('Bs. 500,05')).toBeVisible();
  expect(screen.getByText('35,72 % del gasto mensual')).toBeVisible();
  expect(screen.getByRole('list', { name: 'Detalle textual de gastos de octubre de 2026' })).toBeVisible();
});

it('distinguishes an empty expense period from an unavailable distribution', () => {
  const { rerender } = render(<ExpenseDistribution month="2026-10" distribution={{ status: 'ready', data: [] }} />);
  expect(screen.getByText('Sin gastos en este período')).toBeVisible();
  expect(screen.getByText('No registraste gastos en octubre de 2026.')).toBeVisible();

  rerender(<ExpenseDistribution month="2026-10" distribution={{ status: 'notAvailable' }} />);
  expect(screen.getByText('Este detalle aún no está disponible para la consulta.')).toBeVisible();
  expect(screen.queryByText('Sin gastos en este período')).not.toBeInTheDocument();
});
