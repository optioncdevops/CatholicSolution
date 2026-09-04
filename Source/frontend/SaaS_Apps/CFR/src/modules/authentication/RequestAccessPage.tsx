import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  MailIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@shared/app/components/UiIcons';
import { APP_CATALOG } from '@shared/app/config/appCatalog';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

const requestableApps = APP_CATALOG.filter((app) => app.status !== 'coming-soon');

const organizationTypes = ['Catholic School', 'Parish', 'Diocese / Archdiocese', 'Ministry / Nonprofit', 'Other'] as const;
const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'] as const;

export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  const requestedProduct = searchParams.get('product');
  const initialInterest = requestableApps.some((app) => app.id === requestedProduct) ? requestedProduct! : 'optionc-school';
  const [submitted, setSubmitted] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([initialInterest]);
  const reference = useMemo(() => `CS-${new Date().getFullYear()}-REQ`, []);

  const toggleInterest = (id: string) => setSelectedInterests((current) => (
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  ));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="request-access-page">
      <SolutionHead solutionId="platform" pageTitle="Request Access" />
      <header className="request-access-topbar request-access-topbar--minimal">
        <Brand compact to="/login" />
      </header>

      <section className="request-access-main request-access-main--full">
        {submitted ? <RequestSuccess reference={reference} /> : (
          <>
            <div className="request-access-hero request-access-hero--compact">
              <div className="request-access-hero__copy">
                <span className="request-access-kicker request-access-kicker--inline">access request</span>
                <h1>Request Access</h1>
              </div>
              <span className="request-access-trust-badge"><ShieldCheckIcon size={16} /> Secure request</span>
            </div>

            <form onSubmit={submit} className="request-access-form request-access-form--full request-access-form--compact">
              <AccessSection number="01" title="Contact & organization">
                <div className="request-access-fields-grid">
                  <Field icon={<UserIcon size={16} />} label="First Name" name="firstName" placeholder="Carl" autoComplete="given-name" required />
                  <Field icon={<UserIcon size={16} />} label="Last Name" name="lastName" placeholder="Lapp" autoComplete="family-name" required />
                  <SelectField label="Organization Type" name="organizationType" options={organizationTypes} required />
                  <Field icon={<BuildingIcon size={16} />} label="Organization Name" name="organization" placeholder="Your Catholic organization" autoComplete="organization" required />
                  <Field icon={<MapPinIcon size={16} />} label="Address" name="address" placeholder="Street address" autoComplete="street-address" required />
                  <Field label="City" name="city" placeholder="City" autoComplete="address-level2" required />
                  <SelectField label="State" name="state" options={usStates} required />
                  <Field label="ZIP" name="zip" placeholder="12345" autoComplete="postal-code" required />
                  <Field icon={<MailIcon size={16} />} label="Email" name="workEmail" type="email" placeholder="name@organization.org" autoComplete="email" required />
                 
                  
                  <Field label="Phone Number" name="phone" type="tel" placeholder="(555) 123-4567" autoComplete="tel" />
                </div>
              </AccessSection>

              <AccessSection number="02" title="Applications">
                <div className="access-product-grid request-access-products request-access-products--full">
                  {requestableApps.map((app) => {
                    const selected = selectedInterests.includes(app.id);
                    return (
                      <label key={app.id} className={`access-product ${selected ? 'access-product--selected' : ''}`}>
                        <input type="checkbox" className="sr-only" checked={selected} onChange={() => toggleInterest(app.id)} />
                        <span className="access-product__icon" style={{ background: app.gradient }}>{app.icon}</span>
                        <span className="access-product__copy"><strong>{app.name}</strong><small>{app.category}</small></span>
                        <span className="access-product__check">{selected ? <CheckIcon size={14} /> : null}</span>
                      </label>
                    );
                  })}
                </div>
              </AccessSection>

              <AccessSection number="03" title="Goals & context">
                <div className="request-access-context-grid">
                  <div>
                    <label htmlFor="notes" className="auth-label">What would you like to accomplish?</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="auth-textarea mt-2"
                      placeholder="Share your goals, rollout timeline, or anything that helps us understand what your organization needs."
                    />
                  </div>
                  <aside className="request-access-next">
                    <span><ShieldCheckIcon size={18} /></span>
                    <div>
                      <strong>What happens next?</strong>
                      <p>The appropriate onboarding team reviews your request before access is provisioned.</p>
                    </div>
                  </aside>
                </div>
                <label className="auth-consent request-access-consent">
                  <input type="checkbox" required />
                  <span>I confirm the information above is accurate and may be used to respond to this access request. <b>*</b></span>
                </label>
              </AccessSection>

              <div className="request-access-form__footer request-access-form__footer--full">
                <p><ShieldCheckIcon size={14} /> Prototype only — no real request is transmitted.</p>
                <div>
                  <PlatformLink to="/login" className="auth-secondary-button request-access-footer-back">
                    <ArrowLeftIcon size={15} /> Back to sign in
                  </PlatformLink>
                  <button type="submit" className="auth-primary-button auth-primary-button--submit">
                    Submit request <ArrowRightIcon size={16} />
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>
      <Footer variant="auth" />
    </main>
  );
}

function RequestSuccess({ reference }: { reference: string }) {
  return (
    <section className="request-access-success" aria-live="polite">
      <span className="request-access-success__icon"><CheckIcon size={28} /></span>
      <span className="request-access-kicker">Request captured</span>
      <h1>Your organization access request is ready for review.</h1>
      <p>This prototype demonstrates the completed workflow. In production, the request would be routed to the appropriate Catholic Solutions onboarding or organization administrator process.</p>
      <div className="auth-success-reference"><span>Request reference</span><strong>{reference}</strong><small>No real request is transmitted from this prototype.</small></div>
      <PlatformLink to="/login" className="auth-primary-button auth-primary-button--large">Return to sign in <ArrowRightIcon size={16} /></PlatformLink>
    </section>
  );
}

function AccessSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="request-access-section request-access-section--full">
      <div className="request-access-section__heading">
        <span>{number}</span>
        <div><h3>{title}</h3></div>
      </div>
      <div className="request-access-section__body">{children}</div>
    </section>
  );
}

interface FieldProps { label: string; name: string; type?: string; placeholder?: string; autoComplete?: string; required?: boolean; icon?: ReactNode; }
function Field({ label, name, type = 'text', placeholder, autoComplete, required, icon }: FieldProps) {
  return <div><label className="auth-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label><div className="auth-input-wrap mt-2">{icon ? <span className="auth-input-icon">{icon}</span> : null}<input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required} className={`auth-input ${icon ? '' : 'auth-input--plain'}`} /></div></div>;
}

function SelectField({ label, name, options, required }: { label: string; name: string; options: readonly string[]; required?: boolean }) {
  const placeholder = name === 'state' ? 'Select state' : 'Select organization type';
  return <div><label className="auth-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label><select id={name} name={name} required={required} defaultValue="" className="auth-input auth-input--plain mt-2"><option value="" disabled>{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
}
