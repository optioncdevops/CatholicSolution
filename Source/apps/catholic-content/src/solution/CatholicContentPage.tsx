import { useMemo, useState } from 'react';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { ArrowRightIcon, DownloadIcon, EyeIcon, FileTextIcon, SearchIcon, SparklesIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { SOLUTION_REGISTRY } from '@shared/platform/config/solutionRegistry';
import { resolveSolutionUrl } from '@shared/platform/navigation/solutionNavigation';
import { categories, contentResources, months } from '@/solution/components/contentData';

const app = getAppById('catholic-content')!;
const supportCenterUrl = resolveSolutionUrl(SOLUTION_REGISTRY['support-center']);
const memberServicesUrl = resolveSolutionUrl(SOLUTION_REGISTRY['support-center'], '/?view=new&contact=Member%20Services&product=catholic-content');

export function CatholicContentPage() {
  const { showToast } = useToast();
  const [month, setMonth] = useState('August');
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('aug-06-color');
  const selected = contentResources.find((resource) => resource.id === selectedId) ?? contentResources.at(-1)!;
  const filteredResources = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? contentResources.filter((resource) => `${resource.title} ${resource.displayTitle} ${resource.subtitle}`.toLowerCase().includes(normalized)) : contentResources;
  }, [query]);
  const search = () => {
    if (!query.trim()) { showToast(`${contentResources.length} resources available in this preview`); return; }
    showToast(`${filteredResources.length} resource${filteredResources.length === 1 ? '' : 's'} found for ${query.trim()}`);
    if (filteredResources.length && !filteredResources.some((resource) => resource.id === selectedId)) setSelectedId(filteredResources[0].id);
  };
  const selectMonth = (value: string) => { setMonth(value); showToast(`Saints of the Day for ${value} selected`); };
  const selectCategory = (value: string | null) => { setCategory(value); showToast(value ? `${value} selected` : 'All categories selected'); };

  return (
    <AppLayout app={app} className="cc-premium-page">
      <main className="dashboard-content cc-premium-shell">
        <DashboardHeader eyebrow="Faith resource library" title="Catholic Content" status={<span className="cc-resource-count">1,200+ resources</span>}/>

        <section className="cc-library-card">
          <div className="cc-context-strip cc-context-strip--inside" aria-label="Catholic Content overview">
            <span className="cc-context-icon" aria-hidden="true">✦</span>
            <p><strong>OptionC Catholic Content</strong> provides more than 1,200 high-quality faith-based resources for Catholic schools and religious education programs, with regular additions based on current events in the Church.</p>
            <div className="cc-context-actions"><a href={memberServicesUrl} className="cc-context-link cc-context-link--primary">Contact Member Services <ArrowRightIcon size={13}/></a><a href={supportCenterUrl} className="cc-context-link">Support Center <ArrowRightIcon size={13}/></a></div>
          </div>

          <div className="cc-classic-discovery" aria-label="Resource discovery">
            <div className="cc-classic-discovery__top">
              <div className="cc-filter-block cc-filter-block--months">
                <div className="cc-filter-heading"><strong>Saints of the Day</strong><span>{month}</span></div>
                <div className="cc-filter-options cc-filter-options--months">{months.map((item) => <button key={item} type="button" className={month === item ? 'is-active' : ''} onClick={() => selectMonth(item)}>{item.slice(0,3)}</button>)}</div>
              </div>
              <div className="cc-filter-block cc-filter-block--search">
                <div className="cc-filter-heading"><strong>Search library</strong><span>Saint · Grade · Subject · Patronage · Century · Content Type</span></div>
                <div className="cc-search-inline"><label><SearchIcon size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') search(); }} placeholder="Start typing here to find a topic" aria-label="Search Catholic Content"/></label><button type="button" onClick={search}>Search</button></div>
              </div>
            </div>
            <div className="cc-filter-block cc-filter-block--categories">
              <div className="cc-filter-heading"><strong>Categories</strong><span>{category ?? 'All categories'}</span></div>
              <div className="cc-filter-options cc-filter-options--categories"><button type="button" className={!category ? 'is-active' : ''} onClick={() => selectCategory(null)}>All</button>{categories.map((item) => <button key={item} type="button" className={category === item ? 'is-active' : ''} onClick={() => selectCategory(item)}>{item}</button>)}</div>
            </div>
          </div>

          <div className="cc-workspace cc-workspace--inside">
            <section className="cc-resource-panel" aria-label="Saints of the Day resources">
              <header className="cc-panel-header"><div><span>Resource list</span><h2>Saints of the Day · {month}</h2></div><span className="cc-panel-count">{filteredResources.length}</span></header>
              <div className="cc-table-wrap"><table className="cc-resource-table"><thead><tr><th>Posted Date</th><th>Title</th><th><span className="sr-only">Preview</span></th></tr></thead><tbody>{filteredResources.map((resource) => { const active = resource.id === selectedId; return <tr key={resource.id} className={active ? 'is-selected' : ''}><td>{resource.posted}</td><td><button type="button" onClick={() => setSelectedId(resource.id)}>{resource.title}</button></td><td><button type="button" onClick={() => setSelectedId(resource.id)} aria-label={`Preview ${resource.title}`} className="cc-preview-button"><EyeIcon size={15}/></button></td></tr>; })}{!filteredResources.length ? <tr className="cc-empty-result-row"><td colSpan={3}><strong>No resources found</strong><span>Try a broader saint, subject, grade, or resource-type search.</span><button type="button" onClick={() => setQuery('')}>Clear search</button></td></tr> : null}</tbody></table></div>
            </section>

            <section className="cc-preview-panel" aria-label="Resource preview">
              <header className="cc-panel-header cc-panel-header--preview"><div className="cc-preview-heading"><span>Preview</span><h2>{selected.title}</h2></div><FileTextIcon size={19}/></header>
              <div className="cc-viewer-toolbar"><div className="cc-viewer-file"><button type="button" onClick={() => showToast('Document outline would open here')} className="cc-viewer-icon" aria-label="Document outline">☰</button><span>{selected.title}</span></div><div className="cc-viewer-group"><span className="cc-viewer-chip">1</span><span className="cc-viewer-muted">/ 1</span></div><div className="cc-viewer-group"><button type="button" onClick={() => showToast('Zoom out')} className="cc-viewer-icon" aria-label="Zoom out">−</button><span className="cc-viewer-chip">90%</span><button type="button" onClick={() => showToast('Zoom in')} className="cc-viewer-icon" aria-label="Zoom in">+</button></div><div className="cc-viewer-actions"><button type="button" onClick={() => showToast('Rotate page')} className="cc-viewer-icon" aria-label="Rotate page">↻</button><button type="button" onClick={() => showToast('AI summary of this resource would appear here')} className="cc-viewer-summary"><SparklesIcon size={13}/>Summarize</button><button type="button" onClick={() => showToast('Saved to your library ✓')} className="cc-viewer-icon" aria-label="Save to library">☁</button><button type="button" onClick={() => showToast('Downloading PDF…')} className="cc-viewer-icon" aria-label="Download PDF"><DownloadIcon size={14}/></button><button type="button" onClick={() => showToast('Sending to printer…')} className="cc-viewer-icon" aria-label="Print">▣</button><button type="button" onClick={() => showToast('More options')} className="cc-viewer-icon" aria-label="More options">•••</button></div></div>
              <div className="cc-document-stage"><article className="cc-document-sheet"><span className="cc-document-cross" aria-hidden="true">✝</span><p className="cc-document-kicker">Catholic Content Resource</p><h3>{selected.displayTitle}</h3><p className="cc-document-subtitle">{selected.subtitle}</p><svg viewBox="0 0 300 300" fill="none" stroke="#1a1a1a" strokeWidth="2.4" aria-label="Coloring page line art of a saint"><circle cx="150" cy="150" r="118"/><circle cx="150" cy="118" r="34"/><path d="M150 84 q10 -16 0 -26 q-8 10 0 26"/><path d="M128 112 q6 -6 12 0 M160 112 q6 -6 12 0"/><path d="M144 124 q6 6 12 0"/><path d="M132 138 q18 26 36 0 q-4 34 -18 40 q-14 -6 -18 -40"/><path d="M118 132 q-6 20 4 34 M182 132 q6 20 -4 34"/><path d="M110 210 q40 -34 80 0 l8 58 h-96 z"/><path d="M150 214 v46 M136 228 h28"/></svg></article></div>
            </section>
          </div>

          <section className="cc-rights-strip cc-rights-strip--inside"><div><span aria-hidden="true">§</span><strong>Catholic Content Rights and Permissions</strong></div><p>Articles and other material in OptionC's Content Library are copyrighted and may not be used for commercial purposes. All rights reserved. Except for classroom or homework use, no content may be reproduced, stored, transmitted, or copied without written permission of OptionC. <strong>By using and printing these documents, you agree to these terms.</strong></p></section>
        </section>
      </main>
    </AppLayout>
  );
}
