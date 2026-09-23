import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '@shared/app/components/Brand';
import { EmptyState } from '@shared/app/components/EmptyState';
import { Footer } from '@shared/app/components/Footer';
import { AppDetailsModal } from '@shared/app/components/AppDetailsModal';
import { useToast } from '@shared/app/components/ToastProvider';
import { SearchIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import type { CatalogApp } from '@shared/app/types/app';
import { getProducts } from '../services/productsService';
import { productsFromApiResponse } from '../utils/productsHelpers';
import { ProductCard } from './partials/ProductCard';

const ProductsPage = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<CatalogApp | null>(null);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await getProducts();
        if (!cancelled) setApps(productsFromApiResponse(response));
      } catch (error) {
        console.error('Error loading products:', error);
        if (!cancelled) {
          showToast(typeof error === 'string' ? error : 'Failed to load products.', 'error');
          setApps([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);
  //#endregion

  //#region Functions
  const normalized = query.trim().toLowerCase();
  const visibleApps = useMemo(() => {
    if (!normalized) return apps;
    return apps.filter((app) => [app.name, app.description, app.category, ...app.keywords].join(' ').toLowerCase().includes(normalized));
  }, [apps, normalized]);
  //#endregion

  //#region Handlers
  const requestApp = (app: CatalogApp) => {
    setSelectedApp(null);
    navigate(`/request-access?product=${encodeURIComponent(app.id)}`);
  };
  //#endregion

  //#region Render
  return (
    <main className="request-access-page">
      <SolutionHead solutionId="platform" pageTitle="Products" />
      <header className="request-access-topbar request-access-topbar--minimal">
        <Brand compact to="/login" />
        <PlatformLink to="/login" className="auth-secondary-button">Sign in</PlatformLink>
      </header>

      <section className="request-access-main request-access-main--full">
        <div className="request-access-hero request-access-hero--compact">
          <div className="request-access-hero__copy">
            <span className="request-access-kicker request-access-kicker--inline">our platform</span>
            <h1>Explore Our Products</h1>
          </div>
          <span className="request-access-trust-badge"><ShieldCheckIcon size={16} /> Trusted by Catholic organizations</span>
        </div>

        <label className="hub-page-header__search" style={{ marginBottom: '1rem', maxWidth: '24rem' }}>
          <span className="hub-page-header__search-icon" aria-hidden="true"><SearchIcon size={15} /></span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" />
        </label>

        {loading ? (
          <div className="hub-empty-state">Loading products…</div>
        ) : visibleApps.length === 0 ? (
          <EmptyState
            icon="📦"
            title={normalized ? `No products match "${query}"` : 'No products available yet'}
            description={normalized ? 'Try a different search term.' : 'Check back soon for new products.'}
          />
        ) : (
          <div className="hub-app-grid">
            {visibleApps.map((app) => (
              <ProductCard key={app.id} app={app} onDetails={setSelectedApp} />
            ))}
          </div>
        )}
      </section>
      <Footer variant="auth" />
      <AppDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} onRequest={requestApp} />
    </main>
  );
  //#endregion
};

export default ProductsPage;
