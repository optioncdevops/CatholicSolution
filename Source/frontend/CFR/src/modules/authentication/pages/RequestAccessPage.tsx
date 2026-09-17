import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brand } from '@shared/app/components/Brand';
import { EmptyState } from '@shared/app/components/EmptyState';
import { Footer } from '@shared/app/components/Footer';
import { useToast } from '@shared/app/components/ToastProvider';
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
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { getProducts } from '@/modules/products/services/productsService';
import { productsFromApiResponse } from '@/modules/products/utils/productsHelpers';
import { getDioceses, saveAccessRequest } from '@/modules/requests/services/accessRequestService';
import { toPublicAccessRequestPayload } from '@/modules/requests/utils/accessRequestHelpers';
import { validatePublicAccessRequest } from '@/modules/requests/validator/AccessRequestValidator';
import type { CatalogApp } from '@shared/app/types/app';
import { AccessSection, Field, RequestSuccess, SelectField } from './partials/RequestAccessFields';
import type { DioceseOption } from '@/modules/requests/types/accessRequestTypes';

const organizationTypes = ['Catholic School', 'Parish', 'Diocese / Archdiocese', 'Ministry / Nonprofit', 'Other'] as const;

const readFormValue = (form: HTMLFormElement, name: string) => String(new FormData(form).get(name) ?? '').trim();

const RequestAccessPage = () => {
  //#region Hooks
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const requestedProduct = searchParams.get('product');
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [dioceses, setDioceses] = useState<DioceseOption[]>([]);
  // Coming-soon products aren't requestable yet - only offer the ones already live.
  const requestableApps = useMemo(() => apps.filter((app) => app.hubSection !== 'future'), [apps]);
  const initialInterest = requestableApps.some((app) => app.id === requestedProduct) ? requestedProduct! : '';
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterest ? [initialInterest] : []);
  const [reference, setReference] = useState(`CS-${new Date().getFullYear()}-REQ`);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await getProducts();
        if (!cancelled) setApps(productsFromApiResponse(response));
      } catch (error) {
        console.error('Error loading products:', error);
        if (!cancelled) setApps(productsFromApiResponse([]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await getDioceses();
        const list = (response?.resultData ?? response?.ResultData ?? []) as DioceseOption[];
        if (!cancelled) setDioceses(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error loading dioceses:', error);
        if (!cancelled) setDioceses([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedInterests((current) => {
      const stillValid = current.filter((id) => requestableApps.some((app) => app.id === id));
      if (stillValid.length > 0) return stillValid;
      return requestedProduct && requestableApps.some((app) => app.id === requestedProduct) ? [requestedProduct] : [];
    });
  }, [requestableApps, requestedProduct]);
  //#endregion

  //#region Handlers
  const toggleInterest = (id: string) => setSelectedInterests((current) => (
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  ));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const values = {
      firstName: readFormValue(form, 'firstName'),
      lastName: readFormValue(form, 'lastName'),
      organizationType: readFormValue(form, 'organizationType'),
      organizationName: readFormValue(form, 'organization'),
      address: readFormValue(form, 'address'),
      city: readFormValue(form, 'city'),
      state: readFormValue(form, 'state'),
      zip: readFormValue(form, 'zip'),
      dioceseId: readFormValue(form, 'dioceseId'),
      email: readFormValue(form, 'workEmail'),
      phone: readFormValue(form, 'phone'),
      notes: readFormValue(form, 'notes'),
    };
    const messages = validatePublicAccessRequest(values, selectedInterests.length);
    if (messages.length) {
      showToast(messages[0]);
      return;
    }

    const payload = toPublicAccessRequestPayload(values, requestableApps, selectedInterests);
    setSubmitting(true);
    try {
      const response = await saveAccessRequest(payload);
      const savedId = Number(response?.resultData ?? response?.ResultData ?? 0);
      setReference(savedId > 0 ? `CS-${new Date().getFullYear()}-${savedId}` : `CS-${new Date().getFullYear()}-REQ`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting access request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to submit access request.');
    } finally {
      setSubmitting(false);
    }
  };
  //#endregion

  //#region Render
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

            <form onSubmit={(event) => void submit(event)} className="request-access-form request-access-form--full request-access-form--compact">
              <AccessSection number="01" title="Contact & organization">
                <div className="request-access-fields-grid">
                  <Field icon={<UserIcon size={16} />} label="First Name" name="firstName" placeholder="Carl" autoComplete="given-name" required />
                  <Field icon={<UserIcon size={16} />} label="Last Name" name="lastName" placeholder="Lapp" autoComplete="family-name" required />
                  <SelectField label="Organization Type" name="organizationType" options={organizationTypes} placeholder="Select organization type" required />
                  <Field icon={<BuildingIcon size={16} />} label="Organization Name" name="organization" placeholder="Your Catholic organization" autoComplete="organization" required />
                  <Field icon={<MapPinIcon size={16} />} label="Address" name="address" placeholder="Street address" autoComplete="street-address" required />
                  <Field label="City" name="city" placeholder="City" autoComplete="address-level2" required />
                  <Field label="State" name="state" placeholder="State" autoComplete="address-level1" required />
                  <Field label="ZIP" name="zip" placeholder="12345" autoComplete="postal-code" required />
                  <SelectField
                    label="Diocese"
                    name="dioceseId"
                    options={dioceses.map((d) => ({ value: String(d.dioceseId), label: d.dioceseName }))}
                    placeholder="Select diocese (optional)"
                  />
                  <Field icon={<MailIcon size={16} />} label="Email" name="workEmail" type="email" placeholder="name@organization.org" autoComplete="email" required />
                  <Field label="Phone Number" name="phone" type="tel" placeholder="(555) 123-4567" autoComplete="tel" />
                </div>
              </AccessSection>

              <AccessSection number="02" title="Applications" subtitle="Select every application your organization needs access to.">
                {requestableApps.length === 0 ? (
                  <EmptyState icon="📦" title="No applications available to request" description="Every application is either already assigned or not yet open for requests. Check back soon." />
                ) : (
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
                )}
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
                <p><ShieldCheckIcon size={14} /> Your request is reviewed by the Catholic Solutions onboarding team.</p>
                <div>
                  <PlatformLink to="/login" className="auth-secondary-button request-access-footer-back">
                    <ArrowLeftIcon size={15} /> Back to sign in
                  </PlatformLink>
                  <button type="submit" className="auth-primary-button auth-primary-button--submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit request'} <ArrowRightIcon size={16} />
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
  //#endregion
};

export default RequestAccessPage;
