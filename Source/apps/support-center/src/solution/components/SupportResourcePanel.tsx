import { useMemo, useState } from 'react';
import { ChevronRightIcon, SearchIcon } from '@shared/app/components/UiIcons';
import type { CatalogApp } from '@shared/app/types/app';
import { supportResources } from './supportData';

interface SupportResourcePanelProps {
  products: CatalogApp[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
  onOpen: (title: string) => void;
}

export function SupportResourcePanel({ products, selectedProduct, onProductChange, onOpen }: SupportResourcePanelProps) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const resources = useMemo(() => supportResources.filter((resource) => {
    const matchesProduct = selectedProduct === 'all' || resource.productId === selectedProduct;
    return matchesProduct && (!normalized || [resource.title, resource.category, resource.summary].join(' ').toLowerCase().includes(normalized));
  }), [normalized, selectedProduct]);

  return (
    <section className="support-panel min-h-0">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="dashboard-kicker text-sky-700">Find resources</p><h2 className="mt-1 text-base font-extrabold text-slate-950">Help library</h2></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">{resources.length} articles</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_11rem]">
          <label className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus-within:border-sky-400 focus-within:bg-white"><SearchIcon size={15} className="text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search help articles" aria-label="Search help articles" /></label>
          <select value={selectedProduct} onChange={(event) => onProductChange(event.target.value)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-sky-400" aria-label="Filter help resources by product">
            <option value="all">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
      </div>
      <div className="max-h-[29rem] overflow-y-auto p-2 scrollbar-thin">
        {resources.map((resource) => (
          <button key={resource.id} type="button" onClick={() => onOpen(resource.title)} className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-xs font-black text-sky-700">?</span>
            <span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{resource.category}</span><strong className="mt-0.5 block text-sm leading-5 text-slate-900 group-hover:text-sky-800">{resource.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{resource.summary}</span></span>
            <ChevronRightIcon size={15} className="mt-3 shrink-0 text-slate-300 group-hover:text-sky-600" />
          </button>
        ))}
        {!resources.length ? <div className="px-4 py-10 text-center text-sm text-slate-500">No help resources match your search.</div> : null}
      </div>
    </section>
  );
}
