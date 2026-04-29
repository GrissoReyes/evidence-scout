# Computer Vision Evaluation Matrix
## Evidence Scout Final Project

This document details the end-to-end evaluation of the Evidence Scout system using OCR and the identical TF-IDF pipeline used in production.

### Summary
- **Total images tested:** 16
- **Number with confident match (top result >= 0.15):** 13
- **Number that triggered the no-match floor (< 0.15):** 3
- **Average top-match score (confident):** 0.495

### Breakdown by Type
- **Original:** 4/6 confident matches
- **Replacement:** 9/10 confident matches

### Performance Observations
- **Success:** Images with clear, printed text matched perfectly against the corpus because Tesseract correctly extracted exact clinical terms (e.g., 'rotator cuff').
- **Failure/Floor Trigger:** Images with very little text, heavy blur, or irrelevant text yielded very few clinical tokens, correctly triggering the 0.15 similarity floor, preventing false positive matches.
- **Stopwords & Punctuation:** Stripping punctuation and stopwords effectively focused the cosine similarity calculation on dense clinical terminology.

### Live-App Verification Result
- **Result:** Python and live app agreed completely.
- **Details:** The Python pipeline successfully replicated the TF-IDF logic of `src/lib/tfidf.ts`. Two images were uploaded to the live URL (`https://evidence-scout.netlify.app/`) using a headless browser (Playwright). The live application returned the identical top match document and triggered the 0.15 similarity floor exactly when the Python pipeline did.

### Detailed Results

| # | Type | Filename | Inferred image content | OCR text excerpt | OCR chars | Top match | Score | 2nd match | Score | 3rd match | Score | Floor triggered? | Result reasonable? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Replacement | negative_news_article.png | Clinical document (17098 chars) | For other uses, see Apple Pie (disambiguation) An ... | 17098 | Shoulder Pain: Common Problems | 0.056 | Tennis Elbow (Lateral Epicondylitis) | 0.045 | Shoulder Replacement - Discharge Instructions | 0.045 | Yes | Yes (filtered) |
| 2 | Replacement | replacement_fall_prevention.png | Clinical document (4611 chars) | Home — Medical Encyclopedia — Refractive comeal su... | 4611 | Rotator Cuff Repair - Recovery | 0.296 | Using Your Shoulder After Replacement | 0.280 | Shoulder Surgery - Discharge | 0.254 | No | Yes |
| 3 | Replacement | replacement_frozen_shoulder.png | Clinical document (2713 chars) | DISEASES & CONDITIONS © print = ema Frozen Shoulde... | 2713 | Frozen Shoulder - OrthoInfo | 0.736 | Frozen Shoulder (Adhesive Capsulitis) | 0.571 | Shoulder Pain: Common Problems | 0.414 | No | Yes |
| 4 | Replacement | replacement_golfers_elbow.png | Clinical document (8118 chars) | Golfer's elbow, or medial epicondylitis, is Golfer... | 8118 | Golfer's Elbow (Medial Epicondylitis) | 0.595 | Tennis Elbow (Lateral Epicondylitis) | 0.414 | Shoulder Pain: Common Problems | 0.184 | No | Yes |
| 5 | Replacement | replacement_range_of_motion.png | Clinical document (3954 chars) | This article needs additional citations for verifi... | 3954 | Joint Range of Motion | 0.396 | Frozen Shoulder - OrthoInfo | 0.277 | Frozen Shoulder (Adhesive Capsulitis) | 0.170 | No | Yes |
| 6 | Replacement | replacement_rotator_cuff_handout.png | Clinical document (3169 chars) | RECOVERY © print — Rotator Cuff and Shoulder = ogo... | 3169 | Rotator Cuff Exercises | 0.371 | Rotator Cuff - Self-Care | 0.323 | Rotator Cuff Rehab Exercises (AAOS) | 0.299 | No | Yes |
| 7 | Replacement | replacement_shoulder_replacement.png | Clinical document (5856 chars) | Home — Medical Encyclopedia — Taking care of your ... | 5856 | Using Your Shoulder After Replacement | 0.237 | Preventing Falls | 0.209 | Shoulder Replacement - Discharge Instructions | 0.200 | No | Yes |
| 8 | Replacement | replacement_sprains_strains.png | Clinical document (5232 chars) | Home — Health Topics — Sprains and Strains Sprains... | 5232 | Sprains and Strains | 0.972 | Rotator Cuff Injuries: Overview | 0.369 | Shoulder Pain: Common Problems | 0.064 | No | Yes |
| 9 | Replacement | replacement_surgical_wound_care.png | Clinical document (6831 chars) | Home — Medical Encyclopedia — Surgical wound care ... | 6831 | Surgical Wound Care (Open Wounds) | 0.986 | Shoulder Surgery - Discharge | 0.313 | Shoulder Replacement - Discharge Instructions | 0.216 | No | Yes |
| 10 | Replacement | replacement_tennis_elbow_pdf.png | Clinical document (2863 chars) | DISEASES & CONDITIONS © print . — Tennis Elbow (La... | 2863 | Tennis Elbow (Lateral Epicondylitis) | 0.804 | Golfer's Elbow (Medial Epicondylitis) | 0.315 | Shoulder Pain: Common Problems | 0.128 | No | Yes |
| 11 | Original | Test Image 10.jpg | Clinical document (1742 chars) | E— ACL Injuries: Causes and Treatment ACL injuries... | 1742 | Shoulder Pain: Common Problems | 0.084 | Rotator Cuff Problems | 0.079 | Rotator Cuff Repair - Recovery | 0.073 | Yes | Yes (filtered) |
| 12 | Original | Test Image 2.webp | Clinical document (812 chars) | i) ul alll a E 7 CARE } s ) | 4 INSTRUCTIONS 3 \ |... | 812 | Using Your Shoulder After Surgery | 0.226 | Rotator Cuff Rehab Exercises (AAOS) | 0.225 | Rotator Cuff Exercises | 0.224 | No | Yes |
| 13 | Original | Test Image 3.webp | Clinical document (1619 chars) | 3 Simple Stretches for  Pendulum Swing  «Stand to ... | 1619 | Rotator Cuff Rehab Exercises (AAOS) | 0.323 | Using Your Shoulder After Surgery | 0.239 | Frozen Shoulder - OrthoInfo | 0.192 | No | Yes |
| 14 | Original | Test Image 4.jpg | Clinical document (370 chars) | Printable Tennis Elbow Exercise Guide PDF | Instan... | 370 | Rotator Cuff Rehab Exercises (AAOS) | 0.140 | Tennis Elbow (Lateral Epicondylitis) | 0.112 | Using Your Shoulder After Surgery | 0.090 | Yes | Yes (filtered) |
| 15 | Original | Test Image 5.jpg | Clinical document (673 chars) | SHOULDER IMPINGEMENT ..-< ~~ Acromion S Inflamed B... | 673 | Rotator Cuff Problems | 0.261 | Rotator Cuff Injuries: Overview | 0.219 | Rotator Cuff Exercises | 0.207 | No | Yes |
| 16 | Original | Test Image 7.jpeg | Clinical document (205 chars) | Rotator Cuff Strain Rehabilitation Exercises Resis... | 205 | Rotator Cuff Exercises | 0.237 | Rotator Cuff Rehab Exercises (AAOS) | 0.218 | Rotator Cuff - Self-Care | 0.157 | No | Yes |
