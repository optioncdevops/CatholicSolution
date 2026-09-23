import { AccessSection, Field, SelectField } from '@/modules/authentication/pages/partials/RequestAccessFields';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { useToast } from '@shared/app/components/ToastProvider';
import { ArrowRightIcon, CheckIcon, PlusIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { saveProductRequest, uploadProductRequestLogo } from '../services/productRequestService';
import { toProductRequestPayload } from '../utils/productRequestHelpers';
import { DESCRIPTION_MAX_LENGTH, validateProductRequestFields, type ProductRequestFieldErrors, type ProductRequestFormValues } from '../validator/productRequestValidator';

const navigationOptions = [
  { value: 'same-tab', label: 'Same tab' },
  { value: 'new-tab', label: 'New tab' },
] as const;

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png'];

const readFormValue = (form: HTMLFormElement, name: string) => String(new FormData(form).get(name) ?? '').trim();

const ProductRequestPage = () => {
  //#region Hooks
  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  //#endregion

  //#region States
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState(`CS-${new Date().getFullYear()}-PRD`);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureDraft, setFeatureDraft] = useState('');
  const [logoName, setLogoName] = useState('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProductRequestFieldErrors>({});
  //#endregion

  //#region Handlers
  const getFieldError = (error?: string) => {
    if (!error) return undefined;
    if (error.includes('is required') || error === 'Add at least one feature.') {
      return 'This field is required.';
    }
    return error;
  };

  const clearFieldError = (name: keyof ProductRequestFieldErrors) => {
    setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    if (features.some((feature) => feature.toLowerCase() === value.toLowerCase())) {
      setFeatureDraft('');
      return;
    }
    setFeatures((current) => [...current, value]);
    setFeatureDraft('');
    clearFieldError('features');
  };

  const removeFeature = (feature: string) => {
    setFeatures((current) => current.filter((item) => item !== feature));
  };

  const onFeatureKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addFeature();
    }
  };

  const onLogoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      showToast('Only JPG and PNG images are allowed.', 'error');
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      showToast('Logo file size cannot exceed 2 MB.', 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const savedName = await uploadProductRequestLogo(file);
      setLogoName(savedName);
      setLogoPreviewUrl(URL.createObjectURL(file));
      clearFieldError('logoName');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast(typeof error === 'string' ? error : 'Failed to upload logo.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoName('');
    setLogoPreviewUrl('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const values: ProductRequestFormValues = {
      productName: readFormValue(form, 'productName'),
      shortName: readFormValue(form, 'shortName'),
      description: readFormValue(form, 'description'),
      productionUrl: readFormValue(form, 'productionUrl'),
      features,
      navigationTarget: readFormValue(form, 'navigationTarget') as ProductRequestFormValues['navigationTarget'],
      logoName,
      contactName: readFormValue(form, 'contactName'),
      contactEmail: readFormValue(form, 'contactEmail'),
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
      const response = await saveProductRequest(toProductRequestPayload(values));
      const savedId = Number(response?.resultData ?? response?.ResultData ?? 0);
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
                <h1>Product Request</h1>
              </div>
            </div>

            <form onSubmit={(event) => void submit(event)} noValidate className="request-access-form request-access-form--full request-access-form--compact">
              <AccessSection>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="md:col-span-1">
                    <Field label="Contact User" name="contactName" placeholder="Enter Contact User" autoComplete="name" required maxLength={100} error={getFieldError(fieldErrors.contactName)} onErrorClear={() => clearFieldError('contactName')} />
                  </div>
                  <div className="md:col-span-1">
                    <Field label="Contact Email" name="contactEmail" type="email" placeholder="Enter Contact Email" autoComplete="email" required maxLength={256} error={getFieldError(fieldErrors.contactEmail)} onErrorClear={() => clearFieldError('contactEmail')} />
                  </div>

                  <div className="md:col-span-1">
                    <Field label="Product Name" name="productName" placeholder="Enter Product Name" required maxLength={10} error={getFieldError(fieldErrors.productName)} onErrorClear={() => clearFieldError('productName')} />
                  </div>
                  <div className="md:col-span-1">
                    <Field label="Short Name" name="shortName" placeholder="Enter Short Name" required maxLength={10} error={getFieldError(fieldErrors.shortName)} onErrorClear={() => clearFieldError('shortName')} />
                  </div>
                  <div className="md:col-span-1">
                    <Field label="Production URL" name="productionUrl" type="url" placeholder="Enter Production URL" required maxLength={300} error={getFieldError(fieldErrors.productionUrl)} onErrorClear={() => clearFieldError('productionUrl')} />
                  </div>
                  <div className="md:col-span-1">
                    <SelectField label="Preferred Navigation" name="navigationTarget" options={navigationOptions} placeholder="Select Preferred Navigation" required error={getFieldError(fieldErrors.navigationTarget)} onErrorClear={() => clearFieldError('navigationTarget')} />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="feature-draft" className="auth-label">Features<span className="ml-1 text-rose-600">*</span></label>
                    <div className="auth-input-wrap mt-2 flex items-center gap-1.5 pr-1.5">
                      <input
                        id="feature-draft"
                        type="text"
                        className="auth-input auth-input--plain"
                        placeholder="Enter Feature"
                        aria-invalid={Boolean(fieldErrors.features)}
                        value={featureDraft}
                        onChange={(event) => setFeatureDraft(event.target.value)}
                        onKeyDown={onFeatureKeyDown}
                        maxLength={100}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        disabled={!featureDraft.trim()}
                        aria-label="Add feature"
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-[#12264c] text-white transition-colors hover:bg-[#1b355f] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                    {features.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {features.map((feature) => (
                          <span key={feature} className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d9bf] bg-[#fffaf0] py-1 pl-3 pr-1.5 text-xs font-bold text-[#7a5d1e]">
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              aria-label={`Remove ${feature}`}
                              className="grid size-4 place-items-center rounded-full text-[#a3894f] transition-colors hover:bg-[#12264c] hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : fieldErrors.features ? (
                      <p className="auth-field-error !text-red-600 mt-2">{getFieldError(fieldErrors.features)}</p>
                    ) : (
                      <p className="mt-2 text-[11px] text-slate-400">Add what makes this product useful.</p>
                    )}
                  </div>

                  <div className="md:col-span-3 mt-2">
                    <label htmlFor="description" className="auth-label">Description{<span className="ml-1 text-rose-600">*</span>}</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      maxLength={DESCRIPTION_MAX_LENGTH}
                      className={`auth-textarea mt-2 ${fieldErrors.description ? '!border-[#e11d48] !bg-[#fff1f2]' : ''}`}
                      placeholder="Enter Description"
                      value={description}
                      onChange={(event) => { setDescription(event.target.value); clearFieldError('description'); }}
                      aria-invalid={Boolean(fieldErrors.description)}
                      aria-describedby={fieldErrors.description ? 'description-error' : undefined}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      {fieldErrors.description ? <p id="description-error" className="auth-field-error !text-red-600">{getFieldError(fieldErrors.description)}</p> : <span />}
                      <span className="text-xs text-[var(--text-muted)]">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                    </div>
                  </div>

                  <div className="md:col-span-1 mt-2">
                    <span className="auth-label">Logo<span className="ml-1 text-rose-600">*</span></span>
                    <div className="mt-2">
                      {logoPreviewUrl || uploadingLogo ? (
                        <div className="relative">
                          <div className="grid h-16 w-40 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
                            {logoPreviewUrl ? (
                              <img src={logoPreviewUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-[11px] text-slate-400">Uploading…</span>
                            )}
                          </div>
                          {logoPreviewUrl && !uploadingLogo ? (
                            <button
                              type="button"
                              onClick={removeLogo}
                              aria-label="Remove logo"
                              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-black/55 text-sm text-white shadow hover:bg-rose-600"
                            >
                              ×
                            </button>
                          ) : null}
                          {logoPreviewUrl ? (
                            <label htmlFor="logo-upload" className="mt-2 block cursor-pointer text-center text-xs font-bold text-[#12264c] hover:underline">
                              Change logo
                            </label>
                          ) : null}
                        </div>
                      ) : (
                        <label
                          htmlFor="logo-upload"
                          className={`flex h-16 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors hover:border-[#12264c] hover:bg-[#f6f8fb] hover:text-[#12264c] ${fieldErrors.logoName ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-300 bg-slate-50 text-slate-400'}`}
                        >
                          <PlusIcon size={16} />
                          <span className="text-xs font-bold">Upload logo</span>
                        </label>
                      )}
                      <input
                        ref={logoInputRef}
                        id="logo-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(event) => void onLogoSelected(event)}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                      {fieldErrors.logoName ? (
                        <p className="auth-field-error !text-red-600 mt-1.5">{getFieldError(fieldErrors.logoName)}</p>
                      ) : (
                        <p className="mt-1.5 text-[11px] text-slate-400">JPG or PNG, up to 2 MB</p>
                      )}
                    </div>
                  </div>
                </div>
              </AccessSection>



              <div className="request-access-form__footer request-access-form__footer--full !flex-col !justify-center">
                <p className="mb-3"><ShieldCheckIcon size={14} /> Your suggestion is reviewed by the Catholic Solutions team.</p>
                <div className="!flex !justify-center !w-full">
                  <button type="submit" className="auth-primary-button auth-primary-button--submit" disabled={submitting || uploadingLogo}>
                    {submitting ? 'Submitting…' : 'Submit Request'} <ArrowRightIcon size={16} />
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
