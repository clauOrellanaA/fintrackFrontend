import { CircleDashed, Wallet } from 'lucide-react';
import { formatBobMoney } from '../../../shared/formatters/money';
import type { DashboardSections } from '../api/contract';
import { cutoffLabel } from '../lib/period';

export function BalanceCard({ balance }: { balance: DashboardSections['balance'] }) {
  if (balance.status === 'notAvailable') {
    return <article className="balance-card balance-card--unavailable">
      <div className="metric-slot-heading"><span className="tile-icon"><Wallet size={19} aria-hidden="true" /></span><span className="coming-soon">No disponible</span></div>
      <h2>Saldo disponible</h2>
      <p>El saldo aún no está disponible para esta consulta.</p>
    </article>;
  }

  return <article className="balance-card">
    <div className="metric-slot-heading"><span className="tile-icon"><Wallet size={19} aria-hidden="true" /></span><span className="balance-card__currency">BOB</span></div>
    <h2 className="balance-card__label">Saldo disponible</h2>
    <p className="balance-card__amount financial-amount">{formatBobMoney(balance.data.amount)}</p>
    <p className="balance-card__cutoff"><CircleDashed size={14} aria-hidden="true" />Corte: {cutoffLabel(balance.data.cutoff)} (Bolivia)</p>
  </article>;
}
