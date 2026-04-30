# Evidence Scout

A clinical reference search application for nurses and patients, built with TF-IDF, cosine similarity, and Tesseract OCR, deployed in the browser.

**Live Application:** [https://evidence-scout.netlify.app](https://evidence-scout.netlify.app)

## Author
**Grissobelle Reyes-Obando, BSN RN MEDSURG-BC**  
Applied AI Student at Miami Dade College

## Course Context
This application serves as the final project for:
*   **CAI2300C (Introduction to NLP)**
*   **CAI2840C (Introduction to Computer Vision)**
Instructor: Dr. Ernesto Lee

## Features
*   **Typed Clinical Search:** Fast, keyword-based search against a curated medical corpus.
*   **Image Upload with OCR:** Extracts text from clinical handouts or phone photos using Tesseract.js.
*   **TF-IDF Cosine Similarity:** Mathematical ranking of document relevance based on clinical terminology.
*   **Safety Floor:** A 0.15 similarity floor ensures that irrelevant queries or poor OCR results do not return misleading matches.
*   **Curated Corpus:** 19 high-quality reference documents sourced from MedlinePlus and OrthoInfo (AAOS).

## Technology Stack
*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Computer Vision:** Tesseract.js for browser-based OCR
*   **Preprocessing:** Python with scikit-learn for corpus vectorization
*   **Deployment:** Netlify (CI/CD)

## Architecture
Evidence Scout uses a two-stage serverless architecture:
1.  **Offline Preprocessing (Python):** The medical corpus is cleaned, tokenized, and vectorized. Vocabulary and IDF values are exported to JSON.
2.  **Browser Execution (JavaScript):** The search engine runs entirely on the user's device. TF-IDF vectors are computed in real-time for queries. 

**Privacy Note:** No patient data or images leave the user's device. All processing (OCR and Search) happens locally in the browser.

## Evaluation
*   **NLP Baseline:** MRR 0.70 on the initial 11-document corpus.
*   **Corpus Expansion:** MRR 0.59 to 0.61 after expanding to 19 documents.
*   **Computer Vision:** 75 percent confident match rate on a 20-image evaluation dataset (including phone photos).

For the full evaluation matrix, see [cv_test_results.md](cv_test_results.md).

## Local Development
To run the project locally:
1.  Clone the repository.
2.  Install dependencies: `npm install --legacy-peer-deps`
3.  Start the dev server: `npm run dev`

## Acknowledgments
Special thanks to Dr. Ernesto Lee for his guidance throughout the Applied AI program at MDC. 

Development supported by platform tools: Antigravity, Claude, and Gemini.
