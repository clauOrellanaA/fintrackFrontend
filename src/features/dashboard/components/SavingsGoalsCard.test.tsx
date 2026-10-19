import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SavingsGoalsCard } from './SavingsGoalsCard';

it('represents active, completed, exceeded and overdue goals from the contract', () => {
  render(<SavingsGoalsCard goals={{ status: 'ready', data: [
    { id: '00000000-0000-4000-8000-000000000001', name: 'Fondo de emergencia', target: '100.00', saved: '0.00', remaining: '100.00', progress: '0.00', state: 'active', targetDate: null },
    { id: '00000000-0000-4000-8000-000000000002', name: 'Viaje', target: '100.00', saved: '30.00', remaining: '70.00', progress: '30.00', state: 'active', targetDate: '2099-12-31' },
    { id: '00000000-0000-4000-8000-000000000003', name: 'Computadora', target: '100.00', saved: '110.00', remaining: '0.00', progress: '110.00', state: 'completed', targetDate: null },
    { id: '00000000-0000-4000-8000-000000000004', name: 'Curso', target: '100.00', saved: '20.00', remaining: '80.00', progress: '20.00', state: 'overdue', targetDate: '2026-01-31' },
  ] }} />);

  expect(screen.getAllByText('En progreso')).toHaveLength(2);
  expect(screen.getByText('Completada')).toBeVisible();
  expect(screen.getByText('Vencida')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Progreso de Computadora: Completada, 110,00 %' })).toBeVisible();
  expect(screen.getByText(/Fecha objetivo: 31 dic 2099/)).toBeVisible();
  expect(screen.queryByText(/Fecha objetivo:.*Fondo de emergencia/)).not.toBeInTheDocument();
});

it('distinguishes no goals from an unavailable goals section', () => {
  const { rerender } = render(<SavingsGoalsCard goals={{ status: 'ready', data: [] }} />);
  expect(screen.getByText('Aún no tienes metas de ahorro para mostrar.')).toBeVisible();

  rerender(<SavingsGoalsCard goals={{ status: 'notAvailable' }} />);
  expect(screen.getByText('Las metas aún no están disponibles para esta consulta.')).toBeVisible();
  expect(screen.queryByText('0 metas')).not.toBeInTheDocument();
});
