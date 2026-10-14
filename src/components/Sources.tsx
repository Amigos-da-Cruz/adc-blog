import { SourceBox } from '@amigos-da-cruz/adc-design-system';
import type { ArticleSource } from '../lib/content';

export function Sources({ sources }: { sources: ArticleSource[] }) {
  return (
    <SourceBox
      fontes={sources.map((source) => (
        <>
          {source.url ? <a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a> : source.title}
          {source.publisher && ` · ${source.publisher}`}
          {source.date && ` · ${source.date}`}
        </>
      ))}
    />
  );
}
