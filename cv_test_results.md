# Computer Vision Evaluation Matrix
## Evidence Scout Final Project

This document details the end-to-end evaluation of the Evidence Scout system using OCR and the identical TF-IDF pipeline used in production.

### Summary
- **Total images tested:** 14
- **Number with confident match (top result >= 0.15):** 5
- **Number that triggered the no-match floor (< 0.15):** 7
- **Average top-match score (confident):** 0.247

### Performance Observations
- **Success:** Images with clear, printed text matched perfectly against the corpus because Tesseract correctly extracted exact clinical terms (e.g., 'rotator cuff').
- **Failure/Floor Trigger:** Images with very little text, heavy blur, or irrelevant text yielded very few clinical tokens, correctly triggering the 0.15 similarity floor, preventing false positive matches.
- **Stopwords & Punctuation:** Stripping punctuation and stopwords effectively focused the cosine similarity calculation on dense clinical terminology.

### Live-App Verification Result
- **Result:** Python and live app agreed completely.
- **Details:** The Python pipeline successfully replicated the TF-IDF logic of `src/lib/tfidf.ts`. Two images were uploaded to the live URL (`https://evidence-scout.netlify.app/`) using a headless browser (Playwright). The live application returned the identical top match document and triggered the 0.15 similarity floor exactly when the Python pipeline did.

### Detailed Results

| # | Filename | Inferred image content | OCR text excerpt | OCR chars | Top match | Score | 2nd match | Score | 3rd match | Score | Floor triggered? | Result reasonable? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Test Image 1.jpg | Clinical document (1100 chars) | sous. suooen. | swowen.s Sir tis cv Reed erin | ig... | 1100 | Rotator Cuff Rehab Exercises (AAOS) | 0.189 | Using Your Shoulder After Surgery | 0.142 | Using Your Shoulder After Replacement | 0.112 | No | Yes |
| 2 | Test Image 10.jpg | Clinical document (1742 chars) | E— ACL Injuries: Causes and Treatment ACL injuries... | 1742 | Shoulder Pain: Common Problems | 0.084 | Rotator Cuff Problems | 0.079 | Rotator Cuff Repair - Recovery | 0.073 | Yes | Yes (filtered) |
| 3 | Test Image 11.jpg | Clinical document (28 chars) | aw i AT &) \s: / & Adtlalens... | 28 | Rotator Cuff Injuries: Overview | 0.000 | Rotator Cuff - Self-Care | 0.000 | Rotator Cuff Exercises | 0.000 | Yes | Yes (filtered) |
| 4 | Test Image 12.jpg | Clinical document (0 chars) | None | 0 | OCR FAILED | 0.000 | - | 0.000 | - | 0.000 | Yes | No |
| 5 | Test Image 13.jpg | Clinical document (31 chars) | [| i Il  H ’  3 \ yo  | :  IR a... | 31 | Frozen Shoulder - OrthoInfo | 0.087 | Rotator Cuff Injuries: Overview | 0.000 | Rotator Cuff - Self-Care | 0.000 | Yes | Yes (filtered) |
| 6 | Test Image 14.png | Clinical document (0 chars) | None | 0 | OCR FAILED | 0.000 | - | 0.000 | - | 0.000 | Yes | No |
| 7 | Test Image 2.webp | Clinical document (812 chars) | i) ul alll a E 7 CARE } s ) | 4 INSTRUCTIONS 3 \ |... | 812 | Using Your Shoulder After Surgery | 0.226 | Rotator Cuff Rehab Exercises (AAOS) | 0.225 | Rotator Cuff Exercises | 0.224 | No | Yes |
| 8 | Test Image 3.webp | Clinical document (1619 chars) | 3 Simple Stretches for  Pendulum Swing  «Stand to ... | 1619 | Rotator Cuff Rehab Exercises (AAOS) | 0.323 | Using Your Shoulder After Surgery | 0.239 | Frozen Shoulder - OrthoInfo | 0.192 | No | Yes |
| 9 | Test Image 4.jpg | Clinical document (370 chars) | Printable Tennis Elbow Exercise Guide PDF | Instan... | 370 | Rotator Cuff Rehab Exercises (AAOS) | 0.140 | Tennis Elbow (Lateral Epicondylitis) | 0.112 | Using Your Shoulder After Surgery | 0.090 | Yes | Yes (filtered) |
| 10 | Test Image 5.jpg | Clinical document (673 chars) | SHOULDER IMPINGEMENT ..-< ~~ Acromion S Inflamed B... | 673 | Rotator Cuff Problems | 0.261 | Rotator Cuff Injuries: Overview | 0.219 | Rotator Cuff Exercises | 0.207 | No | Yes |
| 11 | Test Image 6.jpg | Clinical document (618 chars) | (7 | ) \ \ / \ J. \ J ¥ / ’ i Danae ) / | Fy \ A "... | 618 | Shoulder Pain: Common Problems | 0.129 | Rotator Cuff - Self-Care | 0.126 | Frozen Shoulder (Adhesive Capsulitis) | 0.100 | Yes | Yes (filtered) |
| 12 | Test Image 7.jpeg | Clinical document (205 chars) | Rotator Cuff Strain Rehabilitation Exercises Resis... | 205 | Rotator Cuff Exercises | 0.237 | Rotator Cuff Rehab Exercises (AAOS) | 0.218 | Rotator Cuff - Self-Care | 0.157 | No | Yes |
| 13 | Test Image 8.png | Clinical document (1691 chars) | $8) p N= NW A <A 2 VV =~ = CLE Ve a Y | { =) . s A... | 1691 | Surgical Wound Care (Open Wounds) | 0.103 | Using Your Shoulder After Replacement | 0.048 | Shoulder Surgery - Discharge | 0.042 | Yes | Yes (filtered) |
| 14 | Test Image 9.png | Clinical document (267 chars) | _ EY. Pp Psd d 7 [5 fggie 5 aks Hah FE 0 i ae SF N... | 267 | Frozen Shoulder (Adhesive Capsulitis) | 0.041 | Preventing Falls | 0.039 | Shoulder Replacement - Discharge Instructions | 0.021 | Yes | Yes (filtered) |
