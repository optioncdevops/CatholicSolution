import { useToast } from '@shared/app/components/ToastProvider';

const schedule = [
  { item: 'Tuition · September installment', date: 'Sep 1, 2026', amount: '$1,050.00', status: 'Auto-pay' },
  { item: 'Student activity fee', date: 'Sep 10, 2026', amount: '$125.00', status: 'Scheduled' },
  { item: 'Lunch program', date: 'Sep 15, 2026', amount: '$65.00', status: 'Optional' },
] as const;

const payments = [
  { date: 'Aug 1', description: 'Tuition · August installment', amount: '$1,050.00', method: 'Visa •••• 2481' },
  { date: 'Jul 15', description: 'Technology fee', amount: '$180.00', method: 'Visa •••• 2481' },
  { date: 'Jul 1', description: 'Tuition · July installment', amount: '$1,050.00', method: 'Bank •••• 7342' },
] as const;

export function MattMoneyMemberDashboard() {
  const { showToast } = useToast();

  return (
    <div className="matt-member-dashboard">
      <section aria-label="Household balance summary" className="matt-member-kpi-row">
        <article className="matt-balance-card matt-balance-card--member">
          <div className="matt-balance-card__glow" aria-hidden="true" />
          <p className="matt-balance-card__eyebrow">Amount due</p>
          <h2 className="matt-balance-card__value">$1,240.00</h2>
          <p className="matt-balance-card__subtitle">Due September 1, 2026</p>
          <button
            type="button"
            className="matt-balance-card__cta"
            onClick={() => showToast('Secure payment flow would open here')}
          >
            Make a payment
          </button>
        </article>

        <article className="matt-metric-card">
          <p className="matt-metric-card__label">Next auto-pay</p>
          <p className="matt-metric-card__value">$1,050.00</p>
          <p className="matt-metric-card__detail">Sep 1 · Visa ending 2481</p>
          <div className="matt-metric-card__note is-success">✓ Auto-pay is active</div>
        </article>

        <article className="matt-metric-card">
          <p className="matt-metric-card__label">Paid this year</p>
          <p className="matt-metric-card__value">$7,480.00</p>
          <p className="matt-metric-card__detail">12 successful payments</p>
          <div className="matt-budget-track matt-budget-track--compact" aria-hidden="true">
            <div className="matt-budget-bar matt-budget-bar--ops" style={{ width: '72%' }} />
          </div>
          <p className="matt-metric-card__caption">72% of annual plan complete</p>
        </article>
      </section>

      <div className="matt-overview-grid matt-overview-grid--member">
        <section className="matt-panel matt-panel--transactions">
          <header className="matt-panel__header">
            <div>
              <h2>Upcoming charges</h2>
              <p>Scheduled items for your household account</p>
            </div>
          </header>
          <div className="matt-table-wrap">
            <table className="matt-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Due date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.item}>
                    <td><strong>{row.item}</strong></td>
                    <td>{row.date}</td>
                    <td className="is-amount">{row.amount}</td>
                    <td><span className="matt-status matt-status--auto-pay">{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="matt-panel">
          <header className="matt-panel__header">
            <div>
              <h2>Payment methods</h2>
              <p>Methods available for your account</p>
            </div>
          </header>
          <div className="matt-method-list">
            <button
              type="button"
              className="matt-method-card"
              onClick={() => showToast('Payment method details would open here')}
            >
              <span>
                <strong>Visa •••• 2481</strong>
                <small>Primary · Expires 08/29</small>
              </span>
              <em>Manage</em>
            </button>
            <button
              type="button"
              className="matt-method-add"
              onClick={() => showToast('Add payment method flow would open here')}
            >
              + Add payment method
            </button>
          </div>
        </section>
      </div>

      <section className="matt-panel">
        <header className="matt-panel__header">
          <div>
            <h2>Recent payments</h2>
            <p>Latest successful household transactions</p>
          </div>
        </header>
        <div className="matt-payment-list">
          {payments.map((payment) => (
            <div key={`${payment.date}-${payment.description}`} className="matt-payment-row">
              <span>{payment.date}</span>
              <strong>{payment.description}</strong>
              <em>{payment.method}</em>
              <b>{payment.amount}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
