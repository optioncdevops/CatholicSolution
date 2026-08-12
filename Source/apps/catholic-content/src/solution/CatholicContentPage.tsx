import { useState } from 'react';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { DownloadIcon, EyeIcon, FileTextIcon, SearchIcon, SparklesIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { categories, contentResources, months } from '@/solution/components/contentData';

const app = getAppById('catholic-content')!;

export function CatholicContentPage() {
  const { showToast } = useToast();
  const [month, setMonth] = useState('August');
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('aug-06-color');
  const selected = contentResources.find((resource) => resource.id === selectedId) ?? contentResources.at(-1)!;

  const search = () => showToast(query.trim() ? `Searching Catholic Content for “${query.trim()}”…` : 'Type a topic to search');
  const selectMonth = (value: string) => { setMonth(value); showToast(`Saints of the Day for ${value} would load here`); };
  const selectCategory = (value: string) => { setCategory(value); showToast(`${value} resources would load here`); };
  const memberServices = () => showToast('Member Services contact form would open here');

  return (
    <AppLayout app={app} className="cc-premium-page">
      <main className="dashboard-content cc-premium-shell">
        <DashboardHeader
          eyebrow="Faith resource library"
          title="Catholic Content"
          status={<span className="cc-resource-count">1,200+ resources</span>}
          actions={<button type="button" onClick={memberServices} className="action-secondary cc-request-button">Request content</button>}
        />

        <section className="cc-context-strip" aria-label="Catholic Content overview">
          <span className="cc-context-icon" aria-hidden="true">✦</span>
          <p><strong>OptionC Catholic Content</strong> provides more than 1,200 high-quality faith-based resources for Catholic schools and religious education programs, with regular additions based on current events in the Church.</p>
          <button type="button" onClick={memberServices}>Contact Member Services</button>
        </section>

        <section className="cc-discovery-card" aria-label="Resource discovery">
          <div className="cc-discovery-row">
            <div className="cc-discovery-label"><span>Saints of the Day</span><strong>{month}</strong></div>
            <div className="cc-chip-scroll" role="group" aria-label="Saints of the Day month">
              {months.map((item) => (
                <button key={item} type="button" onClick={() => selectMonth(item)} aria-pressed={month === item} className={`cc-filter-chip ${month === item ? 'is-active' : ''}`}>{item.slice(0, 3)}</button>
              ))}
            </div>
          </div>
          <div className="cc-discovery-row cc-discovery-row--categories">
            <div className="cc-discovery-label"><span>Categories</span>{category ? <button type="button" onClick={() => setCategory(null)}>Clear</button> : <strong>All</strong>}</div>
            <div className="cc-chip-scroll" role="group" aria-label="Catholic Content categories">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => selectCategory(item)} aria-pressed={category === item} className={`cc-filter-chip cc-filter-chip--wide ${category === item ? 'is-active' : ''}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="cc-search-row">
            <div className="cc-search-copy"><strong>Search library</strong><span>Saint · Grade · Subject · Patronage · Century · Content Type</span></div>
            <div className="cc-search-control">
              <SearchIcon size={16}/>
              <input id="content-search" aria-label="Search Catholic Content" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') search(); }} placeholder="Search saints, subjects, grades, and resource types" />
            </div>
            <button type="button" onClick={search} className="cc-search-button">Search</button>
          </div>
        </section>

        <div className="cc-workspace">
          <section className="cc-resource-panel" aria-label="Saints of the Day resources">
            <header className="cc-panel-header">
              <div><span>Resource list</span><h2>Saints of the Day · {month}</h2></div>
              <span className="cc-panel-count">{contentResources.length}</span>
            </header>
            <div className="cc-table-wrap">
              <table className="cc-resource-table">
                <thead><tr><th>Posted Date</th><th>Title</th><th><span className="sr-only">Preview</span></th></tr></thead>
                <tbody>
                  {contentResources.map((resource) => {
                    const active = resource.id === selectedId;
                    return (
                      <tr key={resource.id} className={active ? 'is-selected' : ''}>
                        <td>{resource.posted}</td>
                        <td><button type="button" onClick={() => setSelectedId(resource.id)}>{resource.title}</button></td>
                        <td><button type="button" onClick={() => setSelectedId(resource.id)} aria-label={`Preview ${resource.title}`} className="cc-preview-button"><EyeIcon size={15}/></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="cc-preview-panel" aria-label="Resource preview">
            <header className="cc-panel-header cc-panel-header--preview">
              <div className="cc-preview-heading"><span>Preview</span><h2>{selected.title}</h2></div>
              <FileTextIcon size={19}/>
            </header>
            <div className="cc-viewer-toolbar">
              <div className="cc-viewer-file"><button type="button" onClick={() => showToast('Document outline would open here')} className="cc-viewer-icon" aria-label="Document outline">☰</button><span>{selected.title}</span></div>
              <div className="cc-viewer-group"><span className="cc-viewer-chip">1</span><span className="cc-viewer-muted">/ 1</span></div>
              <div className="cc-viewer-group"><button type="button" onClick={() => showToast('Zoom out')} className="cc-viewer-icon" aria-label="Zoom out">−</button><span className="cc-viewer-chip">90%</span><button type="button" onClick={() => showToast('Zoom in')} className="cc-viewer-icon" aria-label="Zoom in">+</button></div>
              <div className="cc-viewer-actions">
                <button type="button" onClick={() => showToast('Rotate page')} className="cc-viewer-icon" aria-label="Rotate page">↻</button>
                <button type="button" onClick={() => showToast('AI summary of this resource would appear here')} className="cc-viewer-summary"><SparklesIcon size={13}/>Summarize</button>
                <button type="button" onClick={() => showToast('Saved to your library ✓')} className="cc-viewer-icon" aria-label="Save to library">☁</button>
                <button type="button" onClick={() => showToast('Downloading PDF…')} className="cc-viewer-icon" aria-label="Download PDF"><DownloadIcon size={14}/></button>
                <button type="button" onClick={() => showToast('Sending to printer…')} className="cc-viewer-icon" aria-label="Print">▣</button>
                <button type="button" onClick={() => showToast('More options')} className="cc-viewer-icon" aria-label="More options">•••</button>
              </div>
            </div>
            <div className="cc-document-stage">
              <article className="cc-document-sheet">
                <span className="cc-document-cross" aria-hidden="true">✝</span>
                <p className="cc-document-kicker">Catholic Content Resource</p>
                <h3>{selected.displayTitle}</h3>
                <p className="cc-document-subtitle">{selected.subtitle}</p>
                <svg viewBox="0 0 300 300" fill="none" stroke="#1a1a1a" strokeWidth="2.4" aria-label="Coloring page line art of a saint"><circle cx="150" cy="150" r="118"/><circle cx="150" cy="118" r="34"/><path d="M150 84 q10 -16 0 -26 q-8 10 0 26"/><path d="M128 112 q6 -6 12 0 M160 112 q6 -6 12 0"/><path d="M144 124 q6 6 12 0"/><path d="M132 138 q18 26 36 0 q-4 34 -18 40 q-14 -6 -18 -40"/><path d="M118 132 q-6 20 4 34 M182 132 q6 20 -4 34"/><path d="M110 210 q40 -34 80 0 l8 58 h-96 z"/><path d="M150 214 v46 M136 228 h28"/></svg>
              </article>
            </div>
          </section>
        </div>

        <section className="cc-rights-strip">
          <div><span aria-hidden="true">§</span><strong>Catholic Content Rights and Permissions</strong></div>
          <p>Articles and other material in OptionC's Content Library are copyrighted and may not be used for commercial purposes. All rights reserved. Except for classroom or homework use, no content from OptionC's Content Library may be reproduced by any mechanical, photographic or electronic process, or in the form of an audio recording, nor may it be stored in a retrieval system, transmitted or otherwise copied for public or private use without written permission of OptionC. <strong>By using and printing these documents, you hereby agree to these terms.</strong></p>
        </section>
      </main>
    </AppLayout>
  );
}
