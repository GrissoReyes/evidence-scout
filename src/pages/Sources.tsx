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
            let text = rawText.trim()
              .replace(/%3A/g, ':')
              .replace(/%20/g, ' ')
              .replace(/%0A/g, ' ');

            // Strip OrthoInfo boilerplate: leading "Diseases & Conditions" label
            text = text.replace(/^Diseases\s*&\s*Conditions\s*/i, '').trim();

            // Strip OrthoInfo header garbage like "!header logo Print Email Facebook Twitter..."
            text = text.replace(/!header logo[^.]*\./gi, '').trim();
            text = text.replace(/\\\s*\\/g, '').trim();

            // Strip MedlinePlus boilerplate footer/header text
            text = text.replace(/[^.]*\.gov website belongs to[^.]*\./gi, '').trim();
            text = text.replace(/[^.]*Official websites use \.gov[^.]*\./gi, '').trim();
            text = text.replace(/[^.]*Secure \.gov websites use HTTPS[^.]*\./gi, '').trim();
            text = text.replace(/A lock \(.*\) or https:\/\/ means you've safely connected to the \.gov website\./gi, '').trim();
            text = text.replace(/A lock \(.*\) or https:\/\/ means you.*safely connected to the/gi, '').trim();
            text = text.replace(/Share sensitive information only on official, secure websites\./gi, '').trim();
            
            // NEW: Strip URL fragments leaking from scraping
            text = text.replace(/\/\/medlineplus\.gov\/[^ ]+\.html?/gi, '').trim();
            text = text.replace(/^,?\s*secure websites\.?\s*/i, '').trim();

            // Strip OrthoInfo reviewer disclaimer sentence (any sentence containing this phrase)
            text = text.replace(/[^.]*This article was written and\/or reviewed by[^.]*\./gi, '').trim();

            // Split by period followed by space or newline
            let sentences = text.split(/(?<=\.)(?=\s|\n)/).map((s: string) => s.trim()).filter(Boolean);
            
            // Filter out any remaining boilerplate sentences
            sentences = sentences.filter((s: string) => 
              !s.includes('.gov website') &&
              !s.includes('LockLocked') &&
              !s.includes('official, secure websites') &&
              !s.includes('safely connected to') &&
              !s.includes('official government organization') &&
              !s.toLowerCase().includes('secure websites')
            );

            if (sentences.length > 0) {
              let selected = sentences[0];
              
              // Clean leading punctuation/garbage from the selected sentence
              selected = selected.replace(/^[!.,;:\-\s]+/, '').trim();

              if (selected.length < 40 && sentences.length > 1) {
                selected += ' ' + sentences[1];
              }
              
              if (selected.length < 60 && sentences.length > 0) {
                // If it's still too short, try taking more characters
                selected = text.substring(0, 200);
                selected = selected.replace(/^[!.,;:\-\s]+/, '').trim();
              }

              // Defensive check: if the result is still junk or too short
              if (selected.length < 30) {
                selected = isMedline ? `Clinical reference from MedlinePlus on ${doc.title}` : (doc.title || 'Reference document');
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
              desc = desc.replace(/^[!.,;:\-\s]+/, '').trim();
              if (desc.length < 30) {
                desc = isMedline ? `Clinical reference from MedlinePlus on ${doc.title}` : (doc.title || 'Reference document');
              }
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
