import { DownloadIcon, FileTextIcon, StarIcon } from '@shared/app/components/UiIcons';
import type { ContentResource } from './contentData';

function getResourceType(resource: ContentResource) {
  return resource.title.includes('Word Search') ? 'Word Search' : 'Coloring Page';
}

export function ContentPreview({
  resource,
  saved,
  onToggleSaved,
  onAction,
}: {
  resource?: ContentResource;
  saved: boolean;
  onToggleSaved: () => void;
  onAction: (message: string) => void;
}) {
  if (!resource) {
    return (
      <section className="content-preview content-preview--empty">
        <FileTextIcon size={28}/>
        <strong>Select a resource</strong>
        <span>Choose a library item to preview it here.</span>
      </section>
    );
  }

  const resourceType = getResourceType(resource);

  return (
    <section className="content-preview">
      <div className="content-preview__head">
        <div className="min-w-0">
          <span className="metric-label text-violet-700">Resource preview</span>
          <h2>{resource.title}</h2>
          <p>{resourceType} · {resource.posted}</p>
        </div>
        <button
          type="button"
          onClick={onToggleSaved}
          className={`content-preview__save ${saved ? 'is-saved' : ''}`}
        >
          <StarIcon size={16}/>{saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <div className="content-preview__toolbar">
        <span>Page 1 of 1</span>
        <div>
          <button type="button" onClick={() => onAction('AI summary would open here')}>✨ Summarize</button>
          <button type="button" onClick={() => onAction('Download started')}><DownloadIcon size={15}/> Download</button>
          <button type="button" onClick={() => onAction('Print dialog would open')}>Print</button>
        </div>
      </div>
      <div className="content-preview__stage">
        <article className="content-document">
          <span className="content-document__cross">✝</span>
          <p className="content-document__eyebrow">Catholic Solutions · Faith Resource</p>
          <h3>{resource.displayTitle}</h3>
          <p className="content-document__subtitle">{resource.subtitle}</p>
          <div className="content-document__art">✝️</div>
          <p className="content-document__body">
            A faith-based classroom resource prepared for Catholic schools and religious education programs.
          </p>
          <div className="content-document__footer"><span>{resourceType}</span><span>{resource.posted}</span></div>
        </article>
      </div>
      <div className="content-preview__rights">
        <strong>Authorized educational use</strong>
        <span>Distribution, republication, or commercial use requires permission from OptionC Member Services.</span>
      </div>
    </section>
  );
}
