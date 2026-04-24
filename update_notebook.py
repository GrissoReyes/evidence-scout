import json

with open('evidence_scout_phase1.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if 'corpus_path = \'/content/drive/MyDrive/evidence_scout/corpus/\'' in source:
            # We found the B1 cell. Let's add the boilerplate cleaning function
            # right before the loop that reads files.
            
            clean_func = """
import re

def clean_boilerplate(text):
    lines = text.split('\\n')
    cleaned_lines = []
    
    boilerplate_patterns = [
        r'Official websites use \\.gov',
        r'\\.gov means it\\'s official',
        r'Secure \\.gov websites use HTTPS',
        r'padlock icon',
        r'Share sensitive information only on official',
        r'^https?://\\S+$'
    ]
    
    exact_matches = {"Menu", "Search", "Home", "Back to top", "Navigation"}
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        if stripped in exact_matches:
            continue
        if len(stripped.split()) == 1 and stripped.istitle():
             if stripped in ["About", "Contact", "Help", "Login", "Logout"]:
                 continue
                 
        skip = False
        for pattern in boilerplate_patterns:
            if re.search(pattern, stripped, re.IGNORECASE):
                skip = True
                break
                
        if not skip:
            cleaned_lines.append(stripped)
            
    return '\\n'.join(cleaned_lines)
"""
            new_source = source.replace("docs = []\nif os.path.exists(corpus_path):", clean_func + "\ndocs = []\nif os.path.exists(corpus_path):")
            
            # Now replace full_text = content with full_text = clean_boilerplate(content) inside the fallback and the frontmatter branches
            new_source = new_source.replace("full_text = content", "full_text = clean_boilerplate(content)")
            new_source = new_source.replace("full_text = parts[2].strip()", "full_text = clean_boilerplate(parts[2].strip())")
            
            cell['source'] = [new_source]

with open('evidence_scout_phase1.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Notebook updated successfully.")
