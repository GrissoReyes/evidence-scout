# Evidence Scout — Complete Build Specification (v4 — FINAL)

You are building a submission-ready Phase 1 clinical reference search tool for floor nurses. This specification is the single source of truth for the build. Do not add features not listed here. Do not remove features listed here unless a contingency note explicitly allows it. When in doubt, ask before deviating.

---

## PROJECT OVERVIEW

**Name:** Evidence Scout
**Purpose:** Help floor nurses find evidence-based answers to clinical questions in seconds, on phone or laptop, with local-first browser processing after initial asset download.
**Scope (Phase 1):** Upper-extremity orthopedics only (shoulder and elbow).
**Deadline:** Friday, April 24, 2026 at 6:00 PM. The same completed submission will be delivered to a second class at 9:00 AM Saturday, April 25, 2026. There is no additional development time between those deadlines. Treat Friday 6:00 PM as the hard finish line for all deliverables.

**Core user scenario:** A nurse at 8pm has a patient post-shoulder ORIF (open reduction internal fixation). No PT consult on file. Surgeon unreachable. She needs to know how to safely move the patient. She opens Evidence Scout, types "safe positioning after rotator cuff repair," and receives ranked excerpts from trusted clinical reference documents with source attribution.

**Architecture principle:** After the initial asset and corpus download, all search and image-processing functions run locally in the browser. No user query text, uploaded images, or OCR-extracted content is sent to any backend server or third-party API. This applies the "future is local" thesis — WebAssembly, OpenCV.js, Tesseract.js, and IndexedDB do the heavy lifting client-side.

---

## GRADING CONTEXT (for the builder's awareness)

This is a combined project for two classes (Introduction to NLP and Computer Vision). The same deliverables satisfy both classes. The final submission must:

- Visibly demonstrate classical NLP pipeline techniques (tokenization, stopwords, TF-IDF, cosine similarity)
- Visibly demonstrate classical CV pipeline techniques (grayscale conversion, thresholding, contour detection, bitwise masking, OCR)
- Include plain-English explanations of every technique used
- Produce a deployable live URL, a documented Colab notebook, and exportable data artifacts
- Map each technique back to the classroom curriculum where possible

Build choices should favor visible, inspectable pipeline steps over invisible-but-correct optimization.

---

## CRITICAL CROSS-CUTTING REQUIREMENT — PREPROCESSING PARITY

The Python pipeline (Colab notebook) and the browser pipeline (web app) MUST use identical preprocessing steps. This is non-negotiable. Any mismatch will cause the TF-IDF vocabulary exported from Python to contain terms the browser cannot find during search, producing zero results.

**Shared preprocessing pipeline (used in BOTH Python and browser):**

1. Lowercase
2. Strip punctuation
3. Tokenize on whitespace
4. Remove standard English stopwords
5. Remove custom clinical stopwords: `["mg", "po", "bid", "tid", "qid", "patient", "doctor", "provider", "hospital", "tablet", "ml", "cc", "prn", "stat", "rn", "md", "np", "pa"]`

**Do NOT apply stemming. Do NOT apply lemmatization. In either pipeline.**

This is a deliberate engineering decision to guarantee cross-platform consistency. It will be documented as an honest trade-off in the report's Limitations section.

---

## ACCEPTANCE CRITERIA (pass/fail)

The build is successful when ALL of the following are true:

1. **Colab notebook runs end-to-end in Google Colab with no manual code changes required** after mounting Drive and running cells in order.
2. **The notebook exports 4 JSON files** (`vocabulary.json`, `idf_values.json`, `document_vectors.json`, `document_metadata.json`) to the Drive exports folder with non-zero file sizes.
3. **The web app builds successfully** with `npm run build` producing no errors.
4. **The deployed live URL loads the home page** in under 5 seconds on a standard laptop browser on a standard broadband connection.
5. **A typed search query returns up to 5 ranked results in under 3 seconds** on a standard laptop browser after initial assets are cached, measured from submit click to results render.
6. **Every result displays** the source document title, a clickable source URL (when available), a similarity score, and a 200-character excerpt.
7. **An uploaded image runs through the CV pipeline and returns OCR-extracted text that feeds into a search** without a page reload.
8. **OCR confidence is surfaced to the user.** If average confidence is below 60%, the UI displays a message: *"Text extraction confidence was low. Results may not match your document accurately."*
9. **All 3 sample image buttons work** and produce ranked search results.
10. **All 4 pages (Home, About, How It Works, Sources) are navigable** via the top navigation.
11. **The app is functional in airplane mode after first successful online load.** Tested in Chrome DevTools (Application > Service Workers > Offline) AND on a real iPhone with airplane mode enabled.
12. **No network requests are made during search or OCR after first load.** Verified in Chrome DevTools Network tab.
13. **The app loads and is usable on iPhone Safari** (tested on a real device, not a simulator).
14. **The README is complete** with all sections specified in Deliverable 3.

---

## OUT OF SCOPE FOR PHASE 1 (do not build)

- User authentication, accounts, or login
- Saved results, favorites, or user history
- Voice input
- Multi-language support (English only in Phase 1)
- Additional clinical specialties beyond shoulder and elbow
- Backend API or server
- Database of any kind
- Generative AI answers or chatbot-style responses
- Live web search or external API calls during use
- Diagnosis engine or patient-specific recommendations
- Analytics, telemetry, or usage tracking
- Admin panel or corpus upload UI
- "Coming Soon" UI elements for future features (a plain roadmap paragraph on the About page is acceptable; interactive future-feature UI is not)
- Third-party fonts loaded from external CDNs (use system fonts)
- Next.js, server-side rendering, or any framework other than Vite + React
- Stemming or lemmatization (see preprocessing parity requirement above)

---

## DELIVERY RISK NOTES (for human reviewer only)

The typed-search workflow is the **primary demo path**. It depends on the TF-IDF + cosine similarity pipeline, which is stable and well-understood.

The image-upload OCR workflow is the **secondary demo path**. It depends on OpenCV.js and Tesseract.js running in-browser, which has more failure modes (iOS Safari quirks, memory limits, Tesseract asset caching).

If OCR integration in the web app is incomplete by the Thursday evening milestone, typed search remains the primary demo path and OCR can still be demonstrated in the Colab notebook. However, the build should not be declared complete unless Acceptance Criteria 7 and 8 are also met. Build the full spec. This is a risk note, not a directive to descope.

---

## DELIVERABLE 1 — COLAB NOTEBOOK

Build a Google Colab notebook (`.ipynb`) that demonstrates the full NLP and CV pipeline in Python. Every code cell must have a markdown cell above it explaining what the cell does in plain English. The notebook must run end-to-end in Google Colab with no errors.

Include a table of contents at the top linking to each section.

### Section A — Setup

- Mount Google Drive
- Expected corpus path: `/content/drive/MyDrive/evidence_scout/corpus/`
- Expected export path: `/content/drive/MyDrive/evidence_scout/exports/`
- Install: `nltk`, `scikit-learn`, `opencv-python`, `pytesseract`, `matplotlib`, `pandas`, `numpy`
- Install Tesseract binary: `apt install tesseract-ocr`
- Download NLTK data: `stopwords` only (NO `wordnet`, since lemmatization is not used)
- **Visible output required:** print "Setup complete" with a summary of installed package versions.

### Section B — NLP Pipeline

**B1. Load corpus**

- Read all `.md` files from the corpus folder into a pandas DataFrame with columns: `filename`, `title`, `source_url`, `full_text`, `clean_text`
- Extract `title` and `source_url` from markdown frontmatter if present.
- **Frontmatter fallback behavior:**
  - If no frontmatter exists: `title` = filename without extension, underscores replaced with spaces, title-cased. `source_url` = empty string.
  - If frontmatter exists but is missing a field: apply the same fallback for that field only.
  - `full_text` should exclude the frontmatter block.
- **Visible output required:**
  - Print number of documents loaded
  - Print total word count across the corpus
  - Print average words per document
  - Display the first 3 rows of the DataFrame (`.head(3)`)
  - Show one example raw markdown file's content alongside its parsed metadata

**B2. Preprocessing (MUST match browser pipeline exactly)**

- Strip markdown formatting (headings, links, bold/italic markers) while preserving the underlying text
- Lowercase
- Strip punctuation
- Tokenize on whitespace (do NOT use `word_tokenize` or any tokenizer that requires punkt — use a simple whitespace split or regex that produces identical results to the browser)
- Remove standard English stopwords from NLTK
- Remove custom clinical stopword list: `["mg", "po", "bid", "tid", "qid", "patient", "doctor", "provider", "hospital", "tablet", "ml", "cc", "prn", "stat", "rn", "md", "np", "pa"]`
- Do NOT apply stemming or lemmatization
- **Visible output required:**
  - Pick one representative document (the rotator cuff repair guideline)
  - Display its text BEFORE preprocessing (first 500 characters)
  - Display its text AFTER each step (markdown stripping, lowercasing, punctuation stripping, tokenization, stopword removal) — first 50 tokens each
  - Print top 20 most frequent tokens BEFORE stopword removal (across the full corpus)
  - Print top 20 most frequent tokens AFTER preprocessing (across the full corpus)
- **Mandatory comment in code:** `# Preprocessing intentionally excludes stemming and lemmatization to match the browser pipeline exactly. See spec: CRITICAL CROSS-CUTTING REQUIREMENT.`

**B3. TF-IDF vectorization**

- Use `sklearn.feature_extraction.text.TfidfVectorizer` with `ngram_range=(1, 2)`
- Configure the vectorizer with `tokenizer=identity_function, preprocessor=identity_function, lowercase=False` so it accepts the already-preprocessed token lists without re-processing
- Fit on the preprocessed documents
- **Visible output required:**
  - Print vocabulary size
  - Print TF-IDF matrix shape (documents × vocabulary)
  - Print the top 20 terms by IDF weight (with their IDF values)
  - Print the top 10 TF-IDF-weighted terms for the rotator cuff repair document

**B4. Cosine similarity search function**

- Build a `search(query, top_k=5)` function that:
  - Preprocesses the query using the identical pipeline as the documents (lowercase, strip punctuation, tokenize, remove stopwords — no stemming, no lemmatization)
  - Vectorizes the query using the fitted TF-IDF vectorizer
  - Computes cosine similarity against all documents
  - Returns the top k results with: document title, source URL, similarity score, and a 200-character excerpt centered on a relevant matching term when possible, otherwise the first 200 characters of the document text
- **Visible output required:**
  - Run the function with 3 sample queries, including "safe positioning after rotator cuff repair"
  - Display results for each query in a readable format (title, score, excerpt)

**B5. Evaluation with MRR**

- Define 12 test queries covering the shoulder and elbow corpus, with each query paired with its expected correct document match.
- For each query, compute the rank of the expected correct result in the search output.
- Calculate Mean Reciprocal Rank: `MRR = mean(1 / rank)` across all queries.
- **Visible output required:**
  - A pandas DataFrame with columns: `query`, `expected_document`, `actual_top_result`, `rank_of_expected`, `reciprocal_rank`
  - The final MRR score printed prominently
  - A brief interpretation cell (markdown) explaining what the score means

### Section C — CV Pipeline

**C1. Load sample image**

- Accept a file path to a sample image (use a bundled demo image stored in Drive at `/content/drive/MyDrive/evidence_scout/samples/demo1.jpg`)
- Display the original image using matplotlib with a caption

**C2. Preprocessing pipeline (display each step visually)**

- Convert BGR to grayscale, display result with caption
- Apply adaptive thresholding (`cv2.adaptiveThreshold` with `ADAPTIVE_THRESH_GAUSSIAN_C`), display result
- ALSO apply global thresholding (`cv2.threshold` with `THRESH_BINARY`) for side-by-side comparison, display both in one matplotlib figure
- Apply morphological operations (dilate then erode) to clean noise, display result
- **Visible output required:** All preprocessing images shown in sequence with captions.

**C3. Contour detection**

- Find contours using `cv2.findContours` with `RETR_EXTERNAL` and `CHAIN_APPROX_SIMPLE`
- Filter contours by area (discard contours below 100 pixels)
- Sort by area, largest first
- Draw all detected contours on a copy of the original image in green, display result
- Identify the largest contour
- Draw its bounding box on the original image in red, display result
- **Visible output required:** Print the number of contours detected before and after filtering; print the area of the largest contour.

**C4. Bitwise masking**

- Create a blank mask the size of the image
- Fill the largest contour on the mask (white on black)
- Apply `cv2.bitwise_and` between the original image and the mask
- Display the masked result alongside the original for comparison

**C5. Crop and OCR**

- Crop the image to the bounding box of the largest contour
- Display the cropped image
- Run `pytesseract.image_to_string` on the cropped image
- Also run `pytesseract.image_to_data` and compute the average confidence across all detected words (excluding -1 confidence values)
- **Visible output required:** Print the extracted text in a formatted block; print the average OCR confidence score.

**C6. End-to-end demo**

- One cell that: takes an image path, runs the full CV pipeline, extracts text, feeds that text as a query into the NLP search function, displays the top 5 results.
- **Visible output required:** A clear narrative printed between steps ("Image loaded → Preprocessed → Text extracted: [X] → Searching corpus → Top results:")

### Section D — JSON Export

Export four JSON files to `/content/drive/MyDrive/evidence_scout/exports/`:

1. `vocabulary.json` — TF-IDF vocabulary (term → index mapping as a dict)
2. `idf_values.json` — IDF values for each term (term → float mapping)
3. `document_vectors.json` — TF-IDF document matrix in sparse form (array of dicts, one per document: `{term_index: tfidf_value}`)
4. `document_metadata.json` — array of objects with: `id`, `title`, `source_url`, `full_text`, `filename`

**Visible output required:** After each export, print the filename and file size in KB. Final cell prints "Export complete. 4 files written to Drive."

### Final Notebook Summary

Add a final markdown cell titled "Summary" explaining:

- What was built in the notebook
- What each exported JSON file contains
- How the exports are consumed by the web app
- Why preprocessing was kept simple (no stemming or lemmatization) — cross-platform parity

---

## DELIVERABLE 2 — WEB APP

Build a client-side web application using **Vite + React + TypeScript + Tailwind CSS**. The app must be a pure client-side build with no server-side rendering. No backend. No external API calls during use beyond initial asset loads.

**Framework choice is locked. Do not substitute Next.js, Remix, or any other framework.**

### Tech stack

- Vite (latest stable)
- React 18+
- TypeScript
- Tailwind CSS
- react-router-dom for client-side page routing
- OpenCV.js (bundled locally in `/public/` — NOT loaded from CDN)
- Tesseract.js (npm package, configured with all assets bundled locally)
- vite-plugin-pwa with default workbox config for service worker and offline caching
- No third-party analytics, tracking, or fonts loaded from external CDNs

### Project structure

    evidence-scout/
        public/
            corpus/
                vocabulary.json
                idf_values.json
                document_vectors.json
                document_metadata.json
            samples/
                sample1.jpg
                sample2.jpg
                sample3.jpg
            tesseract/
                eng.traineddata
                worker.min.js
                tesseract-core.wasm.js
            opencv/
                opencv.js
        src/
            components/
                SearchBar.tsx
                ResultsList.tsx
                ImageUpload.tsx
                SampleImages.tsx
                Navigation.tsx
            pages/
                Home.tsx
                About.tsx
                HowItWorks.tsx
                Sources.tsx
            lib/
                tfidf.ts
                storage.ts
                cv.ts
                ocr.ts
            workers/
                ocr.worker.ts
            types/
                opencv.d.ts
            App.tsx
            main.tsx
            index.css
        index.html
        vite.config.ts
        tsconfig.json
        tailwind.config.js
        package.json
        README.md

### OpenCV.js asset handling (CRITICAL)

OpenCV.js MUST be bundled locally to guarantee offline availability. Do NOT load from a CDN.

- Download the OpenCV.js file to `/public/opencv/opencv.js` as a build prerequisite
- Reference it via a local script tag in `index.html`: `<script src="/opencv/opencv.js"></script>`
- In `src/types/opencv.d.ts`, declare the OpenCV global ambiently to bypass TypeScript errors: `declare const cv: any;`
- Do NOT attempt to install or resolve TypeScript types for OpenCV.js — they do not exist in a usable form

### Tesseract.js asset handling (CRITICAL)

Tesseract.js fetches THREE files from a remote CDN by default. ALL THREE must be bundled locally for offline operation:

1. `eng.traineddata` — the English language model
2. `worker.min.js` — the Tesseract worker script
3. `tesseract-core.wasm.js` — the WebAssembly engine

All three files MUST live in `/public/tesseract/` and be referenced via `workerPath`, `corePath`, and `langPath` configuration options when creating the Tesseract worker. The default CDN URLs must NOT be used.

### Page 1 — Home (`/`)

Must include:

- Header with "Evidence Scout" branding and tagline: "Clinical evidence, at the bedside."
- Navigation linking to About, How It Works, Sources
- Large text search bar with placeholder: "Ask a clinical question..."
- Submit button and enter-key support
- "Or upload an image" section:
  - Drag-and-drop area
  - A real `<input type="file" accept="image/*" capture="environment">` element, styled with Tailwind's `file:` pseudo-class modifiers (e.g., `file:bg-teal-600 file:text-white file:rounded file:px-4 file:py-2 file:border-0`) so it looks like a clean UI button. Do NOT hide the input with `display: none` and do NOT trigger file inputs with `.click()` from JavaScript — both break iOS Safari.
  - 3 "Try a sample image" buttons that load pre-embedded sample images from `/samples/` and run the pipeline
- Loading indicator during OCR processing (spinner or progress bar)
- OCR confidence message: if average confidence is below 60%, display a yellow warning banner above the results: *"Text extraction confidence was low. Results may not match your document accurately."*
- Graceful OCR failure: if OCR produces no text or extraction errors out, display: *"We couldn't read text from this image. Try a clearer photo or type your question instead."* — do NOT crash the app.
- Results section (appears below after a search):
  - Up to 5 results (fewer if similarity threshold is not met)
  - Each result shows: document title, clickable source URL, similarity score as percentage, 200-character excerpt
  - "No strong matches found" message when all similarities are below 0.05
- Footer disclaimer: "For educational reference only. Not clinical advice. Always verify against institutional protocols."

### Page 2 — About (`/about`)

Plain-language explanation including:

- What Evidence Scout is
- Who it's for (floor nurses)
- Why it exists (the 8pm ORIF scenario)
- Current Phase 1 scope (shoulder and elbow)
- Roadmap to Phase 2 as static descriptive text only (no interactive UI for unbuilt features)

### Page 3 — How It Works (`/how-it-works`)

Three-step explanation with icons:

1. **You search or upload** — Type a clinical question or take a photo of a protocol page.
2. **Your device does the work** — OpenCV.js cleans images, Tesseract.js reads text, TF-IDF + cosine similarity finds matching reference documents. All in your browser.
3. **You get ranked answers** — Up to 5 matches with source attribution, in seconds.

Plain-English note: "After your first visit, Evidence Scout's core search and image-processing features work offline. Your queries and images never leave your device."

### Page 4 — Sources (`/sources`)

List all 11 corpus documents with:

- Title
- Source organization (MedlinePlus / OrthoInfo)
- Clickable external link
- Brief description

### NLP in the browser (src/lib/tfidf.ts)

Implement in TypeScript:

- `loadCorpus()` — loads the 4 JSON files from `/corpus/`, caches in IndexedDB, returns loaded data
- `preprocessQuery(query: string): string[]` — MUST produce identical output to the Python preprocessing pipeline: lowercase, strip punctuation, tokenize on whitespace, remove standard English stopwords AND the custom clinical stopword list. Do NOT apply stemming or lemmatization. A comment above this function must read: `// Preprocessing MUST match Python pipeline exactly. See spec: CRITICAL CROSS-CUTTING REQUIREMENT.`
- `vectorizeQuery(tokens: string[], vocabulary, idfValues): Map<number, number>` — build the query's TF-IDF vector
- `cosineSimilarity(queryVec, docVec): number` — standard cosine similarity
- `search(query: string, topK: number = 5): SearchResult[]` — orchestrates everything, applies the 0.05 similarity floor, returns ranked results with title, URL, score, and a 200-character excerpt centered on a matching term when possible

### CV pipeline in the browser (src/lib/cv.ts)

Using OpenCV.js (accessed via the global `cv` declared ambiently in `src/types/opencv.d.ts`):

- `loadImage(file: File): Mat` — convert uploaded file to OpenCV Mat
- `downscaleImage(mat: Mat, maxEdge: number = 1500): Mat` — resize so the longest edge is at most 1500px; applied before any other processing to protect iOS Safari memory limits
- `preprocessImage(mat: Mat): Mat` — grayscale → adaptive threshold → morphological cleanup
- `findLargestContour(mat: Mat): {contour, boundingBox}` — contour detection, area filtering
- `applyMask(mat: Mat, contour): Mat` — bitwise AND with contour mask
- `cropToBoundingBox(mat: Mat, box): Mat` — crop result

### OCR with Web Worker

**Critical requirements:**

- Tesseract.js MUST run in a Web Worker via a separate worker file (`src/workers/ocr.worker.ts`), imported using Vite's explicit `?worker` syntax:
  `import OcrWorker from '../workers/ocr.worker?worker';`
  Then instantiate with `new OcrWorker()`. Do NOT use the generic `new Worker('...')` constructor — Vite requires the `?worker` import syntax to compile workers correctly.
- Tesseract.js MUST be configured with ALL THREE local paths:
  - `workerPath: '/tesseract/worker.min.js'`
  - `corePath: '/tesseract/tesseract-core.wasm.js'`
  - `langPath: '/tesseract/'` (Tesseract will look for `eng.traineddata` inside this path)
- When retrieving cached Tesseract assets from IndexedDB as Blobs, they MUST be converted to URLs using `URL.createObjectURL(blob)` before being passed to Tesseract. Tesseract does not accept raw Blobs for path configuration.
- Return OCR confidence score alongside the extracted text

### IndexedDB storage (src/lib/storage.ts)

Wrapper that:

- Caches the 4 corpus JSON files after first fetch (key: `corpus_[filename]`)
- Caches the Tesseract assets as Blobs (keys: `tesseract_eng_traineddata`, `tesseract_worker`, `tesseract_core`)
- Exposes `getCached(key)` and `setCached(key, value)` helpers
- Exposes `getCachedAsURL(key)` that retrieves a cached Blob and returns a URL via `URL.createObjectURL(blob)` — this is the method that feeds Tesseract's path configuration
- Falls back to fetching from `/public/` paths if IndexedDB is unavailable, logs a warning

### iOS Safari requirements (non-negotiable)

- File input is a real `<input type="file">` tapped directly by the user, styled via Tailwind's `file:` pseudo-class modifiers. No `display: none`. No `.click()` from JavaScript.
- Images are downscaled to max 1500px on the longest edge before OCR processing (see `downscaleImage` in CV API)
- The `capture="environment"` attribute is present on the file input

### Offline behavior

After first page load, the app must function with network disconnected:

- Corpus JSON files served from IndexedDB
- Tesseract assets (all three files) served from IndexedDB via object URLs
- OpenCV.js served from `/public/opencv/opencv.js` and cached by the vite-plugin-pwa service worker (local asset, automatically handled)
- React app bundle cached via vite-plugin-pwa service worker with default workbox config
- Tested in Chrome DevTools Offline mode AND real iPhone airplane mode

### Styling

- Clean, modern, mobile-first
- Tailwind CSS only
- Primary color: medical teal (Tailwind `teal-600`)
- High contrast (WCAG AA minimum for body text)
- Large tap targets (minimum 44px on mobile)
- System font stack (no external font CDNs)
- Semantic HTML with proper labels and ARIA where needed

---

## DELIVERABLE 3 — README

Include `README.md` in the repo root with:

- Project name and one-sentence description
- Live URL (placeholder for Netlify URL)
- Tech stack summary
- Local development instructions (`npm install`, `npm run dev`)
- Build instructions (`npm run build`)
- Asset prerequisites (where to download OpenCV.js and Tesseract worker/core/traineddata files, and where to place them in `/public/`)
- Corpus update instructions (how to replace JSON files from a new Colab export)
- Privacy statement (verbatim from the architecture principle section above)
- Known limitations (Phase 1 scope, OCR accuracy caveats, simplified preprocessing for cross-platform consistency, browser compatibility notes)
- Credits

---

## BUILD COMPLETION CHECKLIST

Before declaring the task complete, verify every item in the Acceptance Criteria section above. Do not declare done until all 14 pass.
