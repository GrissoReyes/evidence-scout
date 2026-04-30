# Evidence Scout

A clinical reference search application for nurses and patients, built with TF-IDF, cosine similarity, and Tesseract OCR, deployed entirely in the browser.

[![Live App](https://img.shields.io/badge/Live%20App-Netlify-teal?style=for-the-badge)](https://evidence-scout.netlify.app)
[![License: TBD](https://img.shields.io/badge/License-TBD-gray?style=for-the-badge)](#license)

## Quick Links
*   **Live Application:** [https://evidence-scout.netlify.app](https://evidence-scout.netlify.app)
*   **Source Code:** [https://github.com/GrissoReyes/evidence-scout](https://github.com/GrissoReyes/evidence-scout)

## About
Evidence Scout is a privacy-first clinical search tool designed for bedside nurses and patients. The application provides two primary ways to find information: a typed clinical search and an image upload feature that uses OCR to digitize printed handouts. All searches are ranked using TF-IDF and cosine similarity against a curated 19-document corpus sourced from MedlinePlus and OrthoInfo. A critical 0.15 similarity floor ensures that low-confidence or out-of-scope results are suppressed for safety. The system is designed to serve both clinicians and patients from the same lightweight browser-based engine.

## Author
*   **Author:** Grissobelle Reyes-Obando, BSN RN MEDSURG-BC
*   **Program:** Applied Artificial Intelligence, Miami Dade College
*   **Course:** Final project for CAI2300C (Natural Language Processing) and CAI2840C (Computer Vision)
*   **Instructor:** Dr. Ernesto Lee

## Features
*   **Typed Clinical Search:** Fast keyword-based search with TF-IDF ranking.
*   **Image Upload OCR:** Digitizes handouts in the browser using Tesseract.js Web Workers.
*   **Safety Floor:** A 0.15 similarity threshold that suppresses irrelevant or noisy results.
*   **Curated Corpus:** 19 high-quality clinical reference documents from MedlinePlus and OrthoInfo.
*   **Sources Page:** Transparent attribution for every document in the corpus.
*   **Offline-Capable:** IndexedDB caching for fast, offline browser performance.
*   **Privacy-First:** Fully serverless architecture. No patient data, search logs, or images ever leave your device.

## Technology Stack
*   **Frontend:** React, TypeScript, Tailwind CSS
*   **OCR Engine:** Tesseract.js
*   **Search Logic:** Custom TF-IDF + Cosine Similarity implementation in `src/lib/tfidf.ts`
*   **Preprocessing:** Python and scikit-learn (via Google Colab)
*   **Browser Storage:** IndexedDB for corpus caching
*   **Deployment:** Netlify with CI/CD from GitHub

## Architecture
Evidence Scout follows a two-stage architecture:
1.  **Offline Preprocessing:** A Python-based pipeline (Google Colab) scrapes clinical sources, cleans the text, and computes global IDF values and document vectors. These are exported as JSON files to `public/corpus/`.
2.  **Online Search:** The browser-based JavaScript engine loads these JSON files, caches them in IndexedDB, and performs real-time TF-IDF vectorization and cosine similarity on user queries locally. 

This design eliminates the need for a server and ensures 100 percent data privacy.

## Repository Structure
```
public/corpus/      # 19 JSON-formatted corpus documents
src/                # React application source code
src/lib/tfidf.ts    # Core TF-IDF and cosine similarity engine
src/pages/          # Application views (Home, Sources, About)
cv_test_results.md  # 20-image Computer Vision evaluation matrix
```

## How to Run Locally
1.  Clone the repository:
    ```bash
    git clone https://github.com/GrissoReyes/evidence-scout.git
    ```
2.  Navigate to the directory:
    ```bash
    cd evidence-scout
    ```
3.  Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Evaluation Results
*   **NLP Performance:** Achieved a Mean Reciprocal Rank (MRR) baseline of 0.70 on the original 11-document corpus, and 0.59 to 0.61 after expansion to 19 documents.
*   **CV Performance:** Evaluated against a 20-image matrix with a 75 percent confident match rate and an average score of 0.477.
*   **Safety Check:** 100 percent correct floor behavior (triggering no-match) on negative and out-of-scope tests.
*   **Detailed Matrix:** See [cv_test_results.md](cv_test_results.md) for full results.

## Safety Design
The 0.15 similarity floor is the most important safety feature of the application. Unlike general-purpose search engines that always attempt to return a top result, a clinical tool must know when to fail. The similarity floor allows the application to suppress results when the OCR quality is too low or the query is entirely outside the scope of the clinical corpus, preventing the display of misleading or irrelevant medical information.

## What's Next
*   **Corpus Expansion:** Scaling to over 100 documents covering med-surg, oncology, and telemetry.
*   **Hybrid Retrieval:** Layering semantic embeddings (RAG) on top of TF-IDF for better conceptual matching.
*   **Persona Toggles:** Differentiating response layers for nurses (clinical) and patients (simplified).

## Acknowledgments
Thank you to Dr. Ernesto Lee for the methodology and the FeNAgO platform foundation. This project was built with the assistance of agentic tools including Antigravity, Claude, and Gemini. Clinical content is curated from MedlinePlus and OrthoInfo (AAOS).

## License
License: TBD. Code is provided as a course project deliverable for Miami Dade College.
