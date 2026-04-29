import { getCached, setCached } from './storage';

export interface SearchResult {
  title: string;
  url: string;
  score: number;
  excerpt: string;
}

const standardEnglishStopwords = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "you're", "you've", "you'll", "you'd", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "she's", "her", "hers", "herself", "it", "it's", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "that'll", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should", "should've", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "aren't", "couldn", "couldn't", "didn", "didn't", "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't", "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't", "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't", "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't"
]);

const customClinicalStopwords = new Set([
  "mg", "po", "bid", "tid", "qid", "patient", "doctor", "provider", "hospital", "tablet", "ml", "cc", "prn", "stat", "rn", "md", "np", "pa"
]);

const allStopwords = new Set([...standardEnglishStopwords, ...customClinicalStopwords]);

let vocabulary: Record<string, number> | null = null;
let idfValues: Record<string, number> | null = null;
let documentVectors: Record<string, number>[] | null = null;
let documentMetadata: any[] | null = null;

export async function loadCorpus() {
  const files = ['vocabulary.json', 'idf_values.json', 'document_vectors.json', 'document_metadata.json'];
  const results: any = {};

  for (const file of files) {
    const key = `corpus_v4_${file}`;
    let data = await getCached(key);
    if (!data) {
      try {
        const res = await fetch(`/corpus/${file}`);
        data = await res.json();
        await setCached(key, data);
      } catch (err) {
        console.error(`Failed to load ${file}`, err);
        continue;
      }
    }
    results[file] = data;
  }

  vocabulary = results['vocabulary.json'];
  idfValues = results['idf_values.json'];
  documentVectors = results['document_vectors.json'];
  documentMetadata = results['document_metadata.json'];

  return results;
}

// Preprocessing MUST match Python pipeline exactly. See spec: CRITICAL CROSS-CUTTING REQUIREMENT.
export function preprocessQuery(query: string): string[] {
  // 1. Lowercase
  let text = query.toLowerCase();
  
  // 2. Strip punctuation
  // Note: Matching Python's string.punctuation
  text = text.replace(/[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/g, '');
  
  // 3. Tokenize on whitespace
  const tokens = text.split(/\s+/).filter(t => t.length > 0);
  
  // 4 & 5. Remove stopwords
  return tokens.filter(token => !allStopwords.has(token));
}

export function vectorizeQuery(tokens: string[], vocab: Record<string, number>, idfs: Record<string, number>): Map<number, number> {
  const vec = new Map<number, number>();
  
  // Count term frequencies
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // 1-grams
  for (const [term, freq] of tf.entries()) {
    if (term in vocab) {
      const idx = vocab[term];
      const idf = idfs[term];
      const weight = freq * idf; // TF * IDF (simplified to term frequency instead of normalized TF to match Scikit-Learn's default behavior, though Scikit normalizes the final vector)
      // Note: scikit-learn uses sublinear_tf=False by default (so tf is raw count).
      vec.set(idx, (vec.get(idx) || 0) + weight);
    }
  }

  // 2-grams
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i+1]}`;
    if (bigram in vocab) {
      const idx = vocab[bigram];
      const idf = idfs[bigram];
      // TF for bigram in this short loop is essentially 1 per occurrence
      vec.set(idx, (vec.get(idx) || 0) + idf);
    }
  }

  // Normalize vector (L2 norm) to match TfidfVectorizer default behavior
  let sumSq = 0;
  for (const val of vec.values()) sumSq += val * val;
  if (sumSq > 0) {
    const norm = Math.sqrt(sumSq);
    for (const [idx, val] of vec.entries()) {
      vec.set(idx, val / norm);
    }
  }

  return vec;
}

export function cosineSimilarity(queryVec: Map<number, number>, docVec: Record<string, number>): number {
  let dotProduct = 0;
  let docNormSq = 0;

  for (const [idxStr, docVal] of Object.entries(docVec)) {
    const idx = parseInt(idxStr, 10);
    const qVal = queryVec.get(idx);
    if (qVal) {
      dotProduct += qVal * docVal;
    }
    docNormSq += docVal * docVal; // Scikit-learn vectors are already L2-normalized, so this is ~1.0
  }

  // If doc vectors are pre-normalized, and query vector is normalized, 
  // the dot product is exactly the cosine similarity.
  return dotProduct;
}

// Minimum cosine similarity required to show a result.
// Queries that score below this on every document return an empty array,
// which the UI treats as "No relevant match found in the current corpus".
export const SIMILARITY_THRESHOLD = 0.15;

export function search(query: string, topK: number = 5): SearchResult[] {
  if (!vocabulary || !idfValues || !documentVectors || !documentMetadata) {
    return [];
  }

  const tokens = preprocessQuery(query);
  const qVec = vectorizeQuery(tokens, vocabulary, idfValues);

  const scores = documentVectors.map((docVec, i) => {
    return {
      index: i,
      score: cosineSimilarity(qVec, docVec)
    };
  });

  scores.sort((a, b) => b.score - a.score);

  const results: SearchResult[] = [];
  for (let i = 0; i < Math.min(topK, scores.length); i++) {
    const s = scores[i];
    if (s.score < SIMILARITY_THRESHOLD) continue; // 15% floor

    const doc = documentMetadata[s.index];
    // Support both old field name (full_text) and new field name (cleaned_text)
    const text = doc.full_text || doc.cleaned_text || '';
    
    const lowerText = text.toLowerCase();
    const matchPositions: number[] = [];
    // Cap at 200 positions to prevent long documents from slowing the excerpt finder.
    const POSITION_CAP = 200;
    for (const token of tokens) {
      if (token.length < 3) continue; // Skip short tokens for centering
      if (matchPositions.length >= POSITION_CAP) break;
      let pos = lowerText.indexOf(token);
      while (pos !== -1 && matchPositions.length < POSITION_CAP) {
        matchPositions.push(pos);
        pos = lowerText.indexOf(token, pos + token.length);
      }
    }

    let bestWindowCenter = -1;
    let maxMatchCount = -1;

    if (matchPositions.length > 0) {
      matchPositions.sort((a, b) => a - b);
      // O(n) two-pointer sliding window: find the position with the most
      // other match positions within 100 chars. This replaces the old
      // O(n^2) double loop that blocked the main thread on long documents.
      let left = 0;
      for (let j = 0; j < matchPositions.length; j++) {
        const center = matchPositions[j];
        // Advance left pointer to drop positions outside the window
        while (matchPositions[left] < center - 100) left++;
        const count = j - left + 1;
        if (count > maxMatchCount) {
          maxMatchCount = count;
          bestWindowCenter = center;
        }
      }
    }

    let excerpt = '';
    if (bestWindowCenter !== -1) {
      const start = Math.max(0, bestWindowCenter - 100);
      const end = Math.min(text.length, bestWindowCenter + 100);
      excerpt = text.substring(start, end).replace(/\n/g, ' ');
      if (start > 0) excerpt = '...' + excerpt;
      if (end < text.length) excerpt = excerpt + '...';
    } else {
      excerpt = text.substring(0, 200).replace(/\n/g, ' ') + '...';
    }

    results.push({
      title: doc.title,
      // Support both old field name (source_url) and new field name (url)
      url: doc.source_url || doc.url || '',
      score: s.score,
      excerpt
    });
  }

  return results;
}
