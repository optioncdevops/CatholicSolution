import { FileTextIcon, StarIcon } from '@shared/app/components/UiIcons';
import type { ContentResource } from './contentData';

function getResourceType(resource: ContentResource) {
  return resource.title.includes('Word Search') ? 'Word Search' : 'Coloring Page';
}

export function ContentResults({
  resources,
  selectedId,
  saved,
  onSelect,
  onToggleSaved,
}: {
  resources: ContentResource[];
  selectedId: string;
  saved: Set<string>;
  onSelect: (id: string) => void;
  onToggleSaved: (id: string) => void;
}) {
  return (
    <section className="content-results">
      <div className="content-results__head">
        <div><span className="metric-label text-slate-400">Results</span><h2>{resources.length} resources</h2></div>
        <span>Newest first</span>
      </div>
      <div className="content-results__list">
        {resources.map((resource) => {
          const resourceType = getResourceType(resource);
          const isSaved = saved.has(resource.id);
          return (
            <article
              key={resource.id}
              className={`content-result ${selectedId === resource.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(resource.id)}
            >
              <span className="content-result__icon"><FileTextIcon size={18}/></span>
              <div className="content-result__copy">
                <div className="content-result__meta"><span>{resourceType}</span><span>{resource.posted}</span></div>
                <h3>{resource.title}</h3>
                <p>{resource.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={(event: { stopPropagation: () => void }) => { event.stopPropagation(); onToggleSaved(resource.id); }}
                className={`content-save ${isSaved ? 'is-saved' : ''}`}
                aria-label={isSaved ? 'Remove from saved resources' : 'Save resource'}
              >
                <StarIcon size={16}/>
              </button>
            </article>
          );
        })}
        {resources.length === 0 ? (
          <div className="content-results__empty">
            <strong>No resources found</strong>
            <span>Try clearing filters or using a broader search term.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
