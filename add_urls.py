import json

url_mapping = {
    "rotator_cuff_overview": "https://medlineplus.gov/rotatorcuffinjuries.html",
    "rotator_cuff_selfcare": "https://medlineplus.gov/ency/patientinstructions/000358.htm",
    "rotator_cuff_exercises": "https://medlineplus.gov/ency/patientinstructions/000357.htm",
    "rotator_cuff_problems": "https://medlineplus.gov/ency/article/000438.htm",
    "rotator_cuff_repair_recovery": "https://medlineplus.gov/ency/article/007207.htm",
    "rotator_cuff_rehab_exercises_aaos": "https://orthoinfo.aaos.org/en/recovery/rotator-cuff-and-shoulder-conditioning-program/",
    "shoulder_replacement_discharge": "https://medlineplus.gov/ency/patientinstructions/000987.htm",
    "frozen_shoulder_medlineplus": "https://medlineplus.gov/ency/article/000455.htm",
    "frozen_shoulder_orthoinfo": "https://orthoinfo.aaos.org/en/diseases--conditions/frozen-shoulder/",
    "tennis_elbow_orthoinfo": "https://orthoinfo.aaos.org/en/diseases--conditions/tennis-elbow-lateral-epicondylitis/",
    "golfers_elbow_orthoinfo": "https://orthoinfo.aaos.org/en/diseases--conditions/medial-epicondylitis-golfers-elbow/"
}

with open('public/corpus/document_metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

for doc in metadata:
    filename = doc.get('filename', '')
    name_no_ext = filename.replace('.md', '')
    if name_no_ext in url_mapping:
        doc['source_url'] = url_mapping[name_no_ext]

with open('public/corpus/document_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f)

print("Updated URLs in document_metadata.json.")
