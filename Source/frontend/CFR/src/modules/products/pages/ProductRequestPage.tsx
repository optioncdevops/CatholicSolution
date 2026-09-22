import { useState, type FormEvent } from 'react';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { useToast } from '@shared/app/components/ToastProvider';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { AccessSection, Field, SelectField } from '@/modules/authentication/pages/partials/RequestAccessFields';
import { saveAccessRequest } from '@/modules/requests/services/accessRequestService';
import { toProductRequestPayload } from '../utils/productRequestHelpers';
import { DESCRIPTION_MAX_LENGTH, validateProductRequestFields, type ProductRequestFieldErrors, type ProductRequestFormValues } from '../validator/productRequestValidator';

const navigationOptions = [
  { value: 'same-tab', label: 'Same tab' },
  { value: 'new-tab', label: 'New tab' },
] as const;

const readFormValue = (form: HTMLFormElement, name: string) => String(new FormData(form).get(name) ?? '').trim();

const ProductRequestPage = () => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState(`CS-${new Date().getFullYear()}-PRD`);
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProductRequestFieldErrors>({});
  //#endregion

  //#region Handlers
  const clearFieldError = (name: keyof ProductRequestFieldErrors) => {
    setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const values: ProductRequestFormValues = {
      productName: readFormValue(form, 'productName'),
      shortName: readFormValue(form, 'shortName'),
      category: readFormValue(form, 'category'),
      description: readFormValue(form, 'description'),
      productionUrl: readFormValue(form, 'productionUrl'),
      features: readFormValue(form, 'features'),
      navigationTarget: (readFormValue(form, 'navigationTarget') || 'same-tab') as ProductRequestFormValues['navigationTarget'],
      contactName: readFormValue(form, 'contactName'),
      contactEmail: readFormValue(form, 'contactEmail'),
      organizationName: readFormValue(form, 'organizationName'),
    };

    const errors = validateProductRequestFields(values);
    setFieldErrors(errors);
    const messages = Object.values(errors).filter((message): message is string => Boolean(message));
    if (messages.length) {
      showToast(messages, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await saveAccessRequest(toProductRequestPayload(values));
      const data = (response?.resultData ?? response?.ResultData ?? {}) as { accessRequestId?: number };
      const savedId = Number(data?.accessRequestId ?? 0);
      setReference(savedId > 0 ? `CS-${new Date().getFullYear()}-${savedId}` : `CS-${new Date().getFullYear()}-PRD`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting product request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to submit product request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <main className="request-access-page">
      <SolutionHead solutionId="platform" pageTitle="Suggest a Product" />
      <header className="request-access-topbar request-access-topbar--minimal">
        <Brand compact to="/login" />
      </header>

      <section className="request-access-main request-access-main--full">
        {submitted ? (
          <section className="request-access-success" aria-live="polite">
            <span className="request-access-success__icon"><CheckIcon size={28} /></span>
            <span className="request-access-kicker">Suggestion captured</span>
            <h1>Your product suggestion is ready for review.</h1>
            <p>The Catholic Solutions team will review your suggestion and follow up using the email you provided.</p>
            <div className="auth-success-reference"><span>Reference</span><strong>{reference}</strong><small>Keep this reference if you need to follow up.</small></div>
            <PlatformLink to="/login" className="auth-primary-button auth-primary-button--large">Return to sign in <ArrowRightIcon size={16} /></PlatformLink>
          </section>
        ) : (
          <>
            <div className="request-access-hero request-access-hero--compact">
              <div className="request-access-hero__copy">
                <span className="request-access-kicker request-access-kicker--inline">product suggestion</span>
                <h1>Suggest a Product</h1>
              </div>
              <span className="request-access-trust-badge"><ShieldCheckIcon size={16} /> Reviewed by our team</span>
            </div>

            <form onSubmit={(event) => void submit(event)} noValidate className="request-access-form request-access-form--full request-access-form--compact">
              <AccessSection number="01" title="Product details">
                <div className="request-access-fields-grid">
                  <Field label="Product Name" name="productName" placeholder="e.g. Parish Hub" required maxLength={100} error={fieldErrors.productName} onErrorClear={() => clearFieldError('productName')} />
                  <Field label="Short Name" name="shortName" placeholder="Optional shorter name" maxLength={50} />
                  <Field label="Category" name="category" placeholder="e.g. Parish Management" required maxLength={100} error={fieldErrors.category} onErrorClear={() => clearFieldError('category')} />
                  <Field label="Production URL" name="productionUrl" type="url" placeholder="https://example.org" maxLength={300} error={fieldErrors.productionUrl} onErrorClear={() => clearFieldError('productionUrl')} />
                  <Field label="Features" name="features" placeholder="Comma-separated, e.g. Billing, Reporting" maxLength={500} />
                  <SelectField label="Preferred Navigation" name="navigationTarget" options={navigationOptions} placeholder="Select how it should open" />
                </div>
                <div className="mt-4">
                  <label htmlFor="description" className="auth-label">Description{<span className="ml-1 text-rose-600">*</span>}</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    className="auth-textarea mt-2"
                    placeholder="What does this product do, and who is it for?"
                    value={description}
                    onChange={(event) => { setDescription(event.target.value); clearFieldError('description'); }}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={fieldErrors.description ? 'description-error' : undefined}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {fieldErrors.description ? <p id="description-error" className="auth-field-error">{fieldErrors.description}</p> : <span />}
                    <span className="text-xs text-[var(--text-muted)]">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                  </div>
                </div>
              </AccessSection>

              <AccessSection number="02" title="Your contact info" subtitle="So our team can follow up about this suggestion.">
                <div className="request-access-fields-grid">
                  <Field label="Your Name" name="contactName" placeholder="Carl Lapp" autoComplete="name" required maxLength={100} error={fieldErrors.contactName} onErrorClear={() => clearFieldError('contactName')} />
                  <Field label="Your Email" name="contactEmail" type="email" placeholder="name@organization.org" autoComplete="email" required maxLength={256} error={fieldErrors.contactEmail} onErrorClear={() => clearFieldError('contactEmail')} />
                  <Field label="Organization Name" name="organizationName" placeholder="Optional" autoComplete="organization" maxLength={100} />
                </div>
              </AccessSection>

              <div className="request-access-form__footer request-access-form__footer--full">
                <p><ShieldCheckIcon size={14} /> Your suggestion is reviewed by the Catholic Solutions team.</p>
                <div>
                  <PlatformLink to="/login" className="auth-secondary-button request-access-footer-back">
                    <ArrowLeftIcon size={15} /> Back to sign in
                  </PlatformLink>
                  <button type="submit" className="auth-primary-button auth-primary-button--submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit suggestion'} <ArrowRightIcon size={16} />
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

export default ProductRequestPage;
