import { useToast } from '@shared/app/components/ToastProvider';

const transactions = [
  ['🎓', 'Term 1 tuition batch', 'Fee collection', '+ $450,000', 'Received', true],
  ['⛪', 'Sunday offertory', 'Donations', '+ $86,500', 'Received', true],
  ['🏢', 'Skyline Estates', 'Building rent', '− $240,000', 'Paid', false],
  ['🚌', 'Route 4 bus service', 'Transport', '− $68,000', 'Pending', false],
  ['⛺', 'Camp fee refund — batch 2', 'Refunds', '− $9,850', 'Clearing', false],
] as const;

const budgets = [
  ['School operations', '72% of $1M', 72, 'matt-budget-bar--ops'],
  ['Parish programs', '54% of $600K', 54, 'matt-budget-bar--parish'],
  ['Maintenance', '88% of $400K', 88, 'matt-budget-bar--maintenance'],
] as const;

const metrics = [
  { label: 'Pending tuition fees', value: '$840K', detail: '63 students · reminders sent', icon: '⌛', tone: 'warning', bars: [40, 55, 48, 70, 62, 90] },
  { label: 'Collected this month', value: '$1.21M', detail: '+8% vs July', icon: '↗', tone: 'success', bars: [35, 50, 66, 58, 74, 84] },
] as const;

const quickActions = [
  ['🧾', 'New invoice'],
  ['💸', 'Add expense'],
  ['✅', 'Approvals (5)'],
  ['📑', 'Reports'],
] as const;

function Sparkline({ bars, tone }: { bars: readonly number[]; tone: 'warning' | 'success' }) {
  return (
    <div className={`matt-sparkline matt-sparkline--${tone}`} aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className={index === bars.length - 1 ? 'is-active' : undefined}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function MattMoneyAdminDashboard() {
  const { showToast } = useToast();

  return (
    <div className="matt-admin-dashboard">
      <section aria-label="Account and collection summary" className="matt-kpi-row">
        <article className="matt-balance-card">
          <div className="matt-balance-card__glow" aria-hidden="true" />
          <div className="matt-balance-card__top">
            <div>
              <p className="matt-balance-card__eyebrow">Organization account</p>
              <p className="matt-balance-card__subtitle">Primary operating account · Available funds</p>
            </div>
            <span className="matt-balance-card__badge">Primary</span>
          </div>
          <h2 className="matt-balance-card__value">$4,280,450</h2>
          <div className="matt-balance-card__footer">
            <div>
              <span>Account ending</span>
              <strong>•••• 4921</strong>
            </div>
            <p>Primary organization account</p>
          </div>
        </article>

        {metrics.map((metric) => (
          <article key={metric.label} className={`matt-metric-card matt-metric-card--${metric.tone}`}>
            <div className="matt-metric-card__top">
              <div>
                <p className="matt-metric-card__label">{metric.label}</p>
                <p className="matt-metric-card__value">{metric.value}</p>
              </div>
              <span className="matt-metric-card__icon" aria-hidden="true">{metric.icon}</span>
            </div>
            <p className="matt-metric-card__detail">{metric.detail}</p>
            <Sparkline bars={metric.bars} tone={metric.tone} />
          </article>
        ))}
      </section>

      <div className="matt-overview-grid">
        <section className="matt-panel matt-panel--transactions">
          <header className="matt-panel__header">
            <div>
              <h2>Recent transactions</h2>
              <p>Latest ledger activity across tuition, donations, and expenses</p>
            </div>
            <button type="button" className="matt-panel__link" onClick={() => showToast('Full ledger would open here')}>
              View ledger →
            </button>
          </header>
          <div className="matt-table-wrap">
            <table className="matt-table">
              <thead>
                <tr>
                  <th>Payee / Payer</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(([icon, name, category, amount, status, positive]) => (
                  <tr key={name}>
                    <td>
                      <span className="matt-table__entity">
                        <span className="matt-table__avatar" aria-hidden="true">{icon}</span>
                        <strong>{name}</strong>
                      </span>
                    </td>
                    <td>{category}</td>
                    <td className={positive ? 'is-credit' : 'is-debit'}>{amount}</td>
                    <td>
                      <span className={`matt-status matt-status--${status.toLowerCase()}`}>{status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="matt-side-stack">
          <section className="matt-panel">
            <header className="matt-panel__header">
              <div>
                <h2>Budgets · Term 1</h2>
                <p>Planned utilization across active cost centers</p>
              </div>
            </header>
            <div className="matt-budget-list">
              {budgets.map(([label, value, percent, accent]) => (
                <div key={label} className="matt-budget-row">
                  <div className="matt-budget-row__meta">
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                  <div className="matt-budget-track" aria-hidden="true">
                    <div className={`matt-budget-bar ${accent}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="matt-panel">
            <header className="matt-panel__header">
              <div>
                <h2>Quick actions</h2>
                <p>Common finance operations</p>
              </div>
            </header>
            <div className="matt-quick-actions">
              {quickActions.map(([icon, label]) => (
                <button
                  key={label}
                  type="button"
                  className="matt-quick-action"
                  onClick={() => showToast(`${label} would open here`)}
                >
                  <span aria-hidden="true">{icon}</span>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
