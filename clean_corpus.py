import json
import re
import string
from sklearn.feature_extraction.text import TfidfVectorizer

with open('public/corpus/document_metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

def comprehensive_clean(text):
    # 1. Strip markdown image syntax completely: remove ![.*?](.*?) entirely
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text, flags=re.DOTALL)
    
    # 2. Convert markdown link syntax to plain text: [(.*?)](.*?) becomes $1
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text, flags=re.DOTALL)
    
    # 2b. Clean up broken links from previous runs
    text = re.sub(r'\]\(https?://.*?\)', '', text)
    text = re.sub(r'\(https?://.*?\)', '', text)
    text = re.sub(r'https?://\S+', '', text)
    
    lines = text.split('\n')
    cleaned_lines = []
    
    # 5. Navigation phrases to strip (case-insensitive)
    nav_phrases = ["skip navigation", "read more", "expand section", "go to:", "back to top", "header logo", "patient handouts", "site navigation", "print this page", "email this page"]
    
    garbage_phrases = ["url of this page:", ".gov website belongs to an official government", "organization in the united states.", "%20"]
    
    # 6. Elsevier citation pattern
    citation_pattern = re.compile(r'.*?(?:ed\.|edition).*?Philadelphia.*?\d{4}.*?chap\s*\d+', re.IGNORECASE)
    
    for line in lines:
        # 3. Strip heading markers: remove leading #, ##, ###, ####
        line = re.sub(r'^#+\s*', '', line)
        
        # 4. Strip bold/italic: remove **, __, and single _ around words
        line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
        line = re.sub(r'__(.*?)__', r'\1', line)
        line = re.sub(r'\b_(.*?)_\b', r'\1', line) # use word boundaries for single underscore
        
        # Collapse multiple whitespaces
        line = re.sub(r'\s+', ' ', line).strip()
        
        if not line:
            continue
            
        # 5. Check nav phrases
        skip_line = False
        lower_line = line.lower()
        for nav in nav_phrases:
            if nav in lower_line:
                skip_line = True
                break
        for gb in garbage_phrases:
            if gb in lower_line:
                skip_line = True
                break
        if skip_line:
            continue
            
        # 6. Check citations
        if citation_pattern.search(line):
            continue
            
        # 7. Strip lines that are purely semicolon-separated tags (5+ semicolons)
        if line.count(';') >= 5:
            continue
            
        # 8. Remove lines shorter than 20 characters after other cleanup
        if len(line) < 20:
            continue
            
        cleaned_lines.append(line)
        
    # 10. Collapse multiple newlines (handled by join)
    cleaned_text = '\n'.join(cleaned_lines)
    
    # 11. Trim leading and trailing whitespace
    return cleaned_text.strip()

# Stopwords
standard_stops = {"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "you're", "you've", "you'll", "you'd", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "she's", "her", "hers", "herself", "it", "it's", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "that'll", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should", "should've", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "aren't", "couldn", "couldn't", "didn", "didn't", "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't", "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't", "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't", "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't"}
custom_stops = {"mg", "po", "bid", "tid", "qid", "patient", "doctor", "provider", "hospital", "tablet", "ml", "cc", "prn", "stat", "rn", "md", "np", "pa"}
all_stops = standard_stops.union(custom_stops)

def preprocess(text):
    t2 = text.lower()
    t3 = t2.translate(str.maketrans('', '', string.punctuation))
    t4 = t3.split()
    t5 = [w for w in t4 if w not in all_stops]
    return t5

def identity(x):
    return x

token_lists = []
for doc in metadata:
    cleaned_text = comprehensive_clean(doc['full_text'])
    if not cleaned_text.strip():
        cleaned_text = "Limited content available"
    doc['full_text'] = cleaned_text
    tokens = preprocess(cleaned_text)
    token_lists.append(tokens)

vectorizer = TfidfVectorizer(
    tokenizer=identity, 
    preprocessor=identity, 
    lowercase=False, 
    ngram_range=(1, 2)
)

tfidf_matrix = vectorizer.fit_transform(token_lists)
vocab_dict = {term: int(idx) for term, idx in vectorizer.vocabulary_.items()}
with open('public/corpus/vocabulary.json', 'w', encoding='utf-8') as f:
    json.dump(vocab_dict, f)

idf_dict = {term: float(vectorizer.idf_[vectorizer.vocabulary_[term]]) for term in vocab_dict}
with open('public/corpus/idf_values.json', 'w', encoding='utf-8') as f:
    json.dump(idf_dict, f)

doc_vecs = []
for i in range(tfidf_matrix.shape[0]):
    row = tfidf_matrix.getrow(i)
    vec_dict = {str(col): float(val) for col, val in zip(row.indices, row.data)}
    doc_vecs.append(vec_dict)
with open('public/corpus/document_vectors.json', 'w', encoding='utf-8') as f:
    json.dump(doc_vecs, f)

with open('public/corpus/document_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f)

print("Cleaned metadata and regenerated TF-IDF files successfully.")
