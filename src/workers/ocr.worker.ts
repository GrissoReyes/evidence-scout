import { createWorker } from 'tesseract.js';
import { getCachedAsURL } from '../lib/storage';

self.onmessage = async (e: MessageEvent) => {
  const { imageBase64 } = e.data;
  if (!imageBase64) return;

  try {
    // Attempt to load assets from IndexedDB via Object URLs
    let workerPath = await getCachedAsURL('tesseract_worker');
    let corePath = await getCachedAsURL('tesseract_core');
    await getCachedAsURL('tesseract_eng_traineddata'); // fetch if not cached

    // Tesseract expects langPath to be a directory. If we have a blob URL for the exact file, 
    // it gets tricky because Tesseract appends 'eng.traineddata' to langPath.
    // Actually, tesseract.js v5 createWorker allows passing exact paths via gzip config, 
    // or we can fallback to the local path if caching blob URL doesn't work well for langPath.
    // But the spec says: "Tesseract assets (all three files) served from IndexedDB via object URLs".
    // We can intercept the fetch or pass the blob directly, or just rely on the service worker to cache '/tesseract/'!
    // Wait, the spec explicitly says: "When retrieving cached Tesseract assets from IndexedDB as Blobs, they MUST be converted to URLs using URL.createObjectURL(blob) before being passed to Tesseract. Tesseract does not accept raw Blobs for path configuration."
    // Also: "langPath: '/tesseract/' (Tesseract will look for eng.traineddata inside this path)".
    // If we pass an object URL like blob:http://.../xyz as langPath, Tesseract will look for `blob:http://.../xyz/eng.traineddata`, which is invalid.
    // The spec acknowledges: "All three files MUST live in /public/tesseract/ and be referenced via workerPath, corePath, and langPath configuration options". 
    // Let's use the local paths as fallback and try to use blob urls for worker and core.
    
    // Fallback paths
    workerPath = workerPath || '/tesseract/worker.min.js';
    corePath = corePath || '/tesseract/tesseract-core.wasm.js';
    
    // For langPath, using a blob URL as a prefix doesn't work for Tesseract, so we typically rely on service worker caching the network request to `/tesseract/eng.traineddata`.
    // However, to strictly follow the spec: we will pass the blob URL if we can, but it will fail unless Tesseract handles it.
    // Actually, Tesseract v5 allows `langPath` to be the exact URL if we load it specially, but usually `langPath` is the directory.
    // We will use '/tesseract/' for langPath as instructed: "langPath: '/tesseract/' (Tesseract will look for eng.traineddata inside this path)".
    const langPath = '/tesseract/';

    const worker = await createWorker('eng', 1, {
      workerPath,
      corePath,
      langPath,
      logger: m => console.log(m)
    });

    const ret: any = await worker.recognize(imageBase64);
    
    const words = ret.data.words || [];
    let avgConfidence = 0;
    if (words.length > 0) {
      let sum = 0;
      let count = 0;
      words.forEach((w: any) => {
        if (w.confidence !== -1) {
          sum += w.confidence;
          count++;
        }
      });
      avgConfidence = count > 0 ? sum / count : 0;
    }

    await worker.terminate();

    self.postMessage({
      success: true,
      text: ret.data.text,
      confidence: avgConfidence
    });
  } catch (error: any) {
    console.error("OCR Error:", error);
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};
