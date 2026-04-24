import type { SearchResult } from '../lib/tfidf';
import { ExternalLink } from 'lucide-react';

interface Props {
  results: SearchResult[];
  hasSearched: boolean;
}

export default function ResultsList({ results, hasSearched }: Props) {
  if (!hasSearched) return null;

  if (results.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm text-center border border-gray-100">
        <p className="text-gray-500">No strong matches found. Try a different search term or check spelling.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Top Matches</h2>
      {results.map((result, idx) => (
        <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-teal-700">{result.title}</h3>
            <span className="text-xs font-mono bg-teal-50 text-teal-700 px-2 py-1 rounded">
              {(result.score * 100).toFixed(1)}% match
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            "{result.excerpt}"
          </p>
          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Full Source Document <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
