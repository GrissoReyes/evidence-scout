import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function Sources() {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    fetch('/corpus/document_metadata.json')
      .then(res => res.json())
      .then(data => {
        const processed = data.map((doc: any) => {
          // Support both old field names (source_url, full_text) and new (url, cleaned_text)
          const url = doc.source_url || doc.url || '';
          const isMedline = url.includes('medlineplus.gov');
          const isOrthoInfo = url.includes('orthoinfo.aaos.org');
          const isAAOS = url.includes('aaos.org');
          const org = isMedline
            ? 'MedlinePlus'
            : (isOrthoInfo || isAAOS)
              ? 'OrthoInfo / AAOS'
              : (doc.source || 'Reference');
          
          let desc = 'No description available';
          const rawText = doc.full_text || doc.cleaned_text || '';
          if (rawText) {
            let text = rawText.trim();

            // Strip OrthoInfo boilerplate: leading "Diseases & Conditions" label
            text = text.replace(/^Diseases\s*&\s*Conditions\s*/i, '').trim();

            // Strip OrthoInfo reviewer disclaimer sentence (any sentence containing this phrase)
            text = text.replace(/[^.]*This article was written and\/or reviewed by[^.]*\./gi, '').trim();

            // Split by period followed by space or newline
            const sentences = text.split(/(?<=\.)(?=\s|\n)/).map((s: string) => s.trim()).filter(Boolean);
            
            if (sentences.length > 0) {
              let selected = sentences[0];
              if (selected.length < 40 && sentences.length > 1) {
                selected += ' ' + sentences[1];
              }
              
              if (selected.length < 60) {
                selected = text.substring(0, 200);
              }
              
              if (selected.length > 250) {
                // Trim to 250 and find last word boundary
                const trimmed = selected.substring(0, 250);
                const lastSpace = trimmed.lastIndexOf(' ');
                selected = lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...';
              }
              
              desc = selected;
            } else {
              desc = text.substring(0, 200) + (text.length > 200 ? '...' : '');
            }
          }
          
          return {
            title: doc.title || 'Untitled',
            org,
            url,
            desc
          };
        });
        setSources(processed);
      })
      .catch(err => console.error("Failed to load sources", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sources</h1>
      <p className="text-gray-600 mb-8">The Evidence Scout Phase 1 corpus consists of the following {sources.length} reference documents.</p>
      
      {sources.length === 0 ? (
        <div className="text-center p-8 text-gray-500">Loading sources...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source, idx) => (
            <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-teal-700 hover:text-teal-900 hover:underline mb-1 block"
              >
                {source.title}
              </a>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{source.org}</span>
              <p className="text-sm text-gray-600 mb-4 flex-grow">{source.desc}</p>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline"
                >
                  Original Source <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
