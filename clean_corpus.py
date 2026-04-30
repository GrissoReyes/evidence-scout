import json
import re
import urllib.parse
from sklearn.feature_extraction.text import TfidfVectorizer
import string

def comprehensive_clean(text):
    if not text:
        return ""
        
    # 1. URL-decode percent-encoded characters
    text = urllib.parse.unquote(text)
    
    # 2. Strip specific junk patterns
    
    # Full URLs matching clinical domains or listservs
    # Catch both with and without protocol (http/https)
    text = re.sub(r'(?:https?://)?(?:medlineplus\.gov|orthoinfo\.aaos\.org|[\w\.]+\.gov/listserv)\S*', '', text, flags=re.IGNORECASE)
    
    # Listserv signup text sentences
    text = re.sub(r'[^.!?\n]*To get updates by email when new information becomes available[^.!?\n]*[.!?]?', '', text, flags=re.IGNORECASE)
    
    # Trusted Health Information header
    text = re.sub(r'Trusted Health Information for you', '', text, flags=re.IGNORECASE)
    
    # Government boilerplate
    text = re.sub(r'A \.gov website belongs to an official government organization in the United States', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Share sensitive information only on official, secure websites\.', '', text, flags=re.IGNORECASE)
    text = re.sub(r'A lock \(.*?\) or https:// means you.*safely connected to the \.gov website\.', '', text, flags=re.IGNORECASE)
    text = re.sub(r',?\s*secure websites\.?', '', text, flags=re.IGNORECASE)
    
    # Navigation and UI markers
    text = re.sub(r'Skip to main content|Skip navigation', '', text, flags=re.IGNORECASE)
    text = re.sub(r'English \| Español|Español', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Print Email Facebook Twitter', '', text, flags=re.IGNORECASE)
    
    # Remove double backslashes
    text = re.sub(r'\\\s*\\', ' ', text)
    
    # MedlinePlus specific "On this page" block
    text = re.sub(r'On this page Basics - Summary - Diagnosis and Tests - Treatments and Therapies Learn More - Specifics See, Play and Learn - Images Research - Clinical Trials - Journal Articles Resources - Find an Expert For You - Children - Patient Handouts Summary', '', text)
    
    # MedlinePlus footer disclaimer
    text = re.sub(r'The information on this site should not be used as a substitute for professional medical care or advice\..*?Learn how to cite this page YesNo Thank you for your feedback!', '', text, flags=re.DOTALL)
    
    # OrthoInfo header garbage
    text = re.sub(r'!header logo.*?\.', '', text, flags=re.IGNORECASE)
    
    # Collapse multiple consecutive whitespace/newlines
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Trim leading/trailing punctuation and whitespace
    text = text.strip(string.punctuation + string.whitespace)
    
    return text

def identity(x):
    return x

def preprocess(text):
    standard_stops = {"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "you're", "you've", "you'll", "you'd", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "she's", "her", "hers", "herself", "it", "it's", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "that'll", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should", "should've", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "aren't", "couldn", "couldn't", "didn", "didn't", "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't", "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't", "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't", "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't"}
    custom_stops = {"mg", "po", "bid", "tid", "qid", "patient", "doctor", "provider", "hospital", "tablet", "ml", "cc", "prn", "stat", "rn", "md", "np", "pa"}
    all_stops = standard_stops.union(custom_stops)
    
    t2 = text.lower()
    t3 = t2.translate(str.maketrans('', '', string.punctuation))
    t4 = t3.split()
    t5 = [w for w in t4 if w not in all_stops]
    return t5

# Load
with open('public/corpus/document_metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

token_lists = []
for doc in metadata:
    content = doc.get('full_text', doc.get('content', ''))
    cleaned = comprehensive_clean(content)
    
    doc['full_text'] = cleaned
    doc['cleaned_text'] = cleaned
    
    # Update description if needed (user constraint: if < 50 chars, fallback to body)
    desc = doc.get('description', '')
    cleaned_desc = comprehensive_clean(desc) if desc else ""
    if len(cleaned_desc) < 50:
        doc['description'] = cleaned[:200].strip(string.punctuation + string.whitespace)
    else:
        doc['description'] = cleaned_desc

    tokens = preprocess(cleaned)
    token_lists.append(tokens)

# Save metadata
with open('public/corpus/document_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2)

# Vectorize
vectorizer = TfidfVectorizer(
    tokenizer=identity, 
    preprocessor=identity, 
    lowercase=False, 
    ngram_range=(1, 2)
)
tfidf_matrix = vectorizer.fit_transform(token_lists)

# Vocabulary
vocab_dict = {term: int(idx) for term, idx in vectorizer.vocabulary_.items()}
with open('public/corpus/vocabulary.json', 'w', encoding='utf-8') as f:
    json.dump(vocab_dict, f, indent=2)

# IDF
idf_dict = {term: float(vectorizer.idf_[vectorizer.vocabulary_[term]]) for term in vocab_dict}
with open('public/corpus/idf_values.json', 'w', encoding='utf-8') as f:
    json.dump(idf_dict, f, indent=2)

# Vectors
doc_vecs = []
for i in range(tfidf_matrix.shape[0]):
    row = tfidf_matrix.getrow(i)
    vec_dict = {str(col): float(val) for col, val in zip(row.indices, row.data)}
    doc_vecs.append(vec_dict)
with open('public/corpus/document_vectors.json', 'w', encoding='utf-8') as f:
    json.dump(doc_vecs, f, indent=2)

print("Cleaned metadata and regenerated TF-IDF files successfully.")
