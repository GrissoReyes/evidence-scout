import { useState, useRef, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ImageUpload from '../components/ImageUpload';
import SampleImages from '../components/SampleImages';
import ResultsList from '../components/ResultsList';
import { search } from '../lib/tfidf';
import type { SearchResult } from '../lib/tfidf';
import { loadImage, downscaleImage, preprocessImage, findLargestContour, cropToBoundingBox } from '../lib/cv';
import OcrWorker from '../workers/ocr.worker?worker';

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Instantiate worker
    workerRef.current = new OcrWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleSearch = (query: string) => {
    setWarningMsg('');
    setErrorMsg('');
    setIsProcessing(true);
    
    // Simulate slight delay so UI feels responsive before synchronous heavy lifting
    setTimeout(() => {
      const res = search(query);
      setResults(res);
      setHasSearched(true);
      setIsProcessing(false);
    }, 100);
  };

  const processImage = async (fileOrUrl: File | string) => {
    setWarningMsg('');
    setErrorMsg('');
    setHasSearched(false);
    setIsProcessing(true);
    
    try {
      setLoadingMsg('Loading image...');
      
      let fileToProcess: File;
      if (typeof fileOrUrl === 'string') {
        const res = await fetch(fileOrUrl);
        const blob = await res.blob();
        fileToProcess = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
      } else {
        fileToProcess = fileOrUrl;
      }

      setLoadingMsg('Processing image with OpenCV...');
      const mat = await loadImage(fileToProcess);
      const downscaled = downscaleImage(mat, 1500);
      const preprocessed = preprocessImage(downscaled);
      const contourData = findLargestContour(preprocessed);

      let cropMat = downscaled;
      if (contourData) {
        cropMat = cropToBoundingBox(downscaled, contourData.boundingBox);
      } else {
        console.warn("No strong contour found, using whole image");
      }

      setLoadingMsg('Extracting text (OCR)...');
      
      // Convert cropped mat to data URL to send to worker
      // cv.imshow requires a canvas. We can create an offscreen canvas.
      const canvas = document.createElement('canvas');
      cv.imshow(canvas, cropMat);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Cleanup mats
      mat.delete();
      if (downscaled !== mat) downscaled.delete();
      preprocessed.delete();
      if (contourData) contourData.contour.delete();
      if (cropMat !== downscaled) cropMat.delete();

      if (!workerRef.current) {
        workerRef.current = new OcrWorker();
      }

      workerRef.current.onmessage = (e) => {
        const { success, text, confidence, error } = e.data;
        if (success) {
          const cleanText = text.trim();
          if (!cleanText) {
            setErrorMsg("We couldn't read text from this image. Try a clearer photo or type your question instead.");
            setIsProcessing(false);
            return;
          }

          if (confidence < 60) {
            setWarningMsg("Text extraction confidence was low. Results may not match your document accurately.");
          }

          // Run search with extracted text
          setLoadingMsg('Searching corpus...');
          const res = search(cleanText);
          setResults(res);
          setHasSearched(true);
        } else {
          setErrorMsg("We couldn't read text from this image. Try a clearer photo or type your question instead.");
          console.error(error);
        }
        setIsProcessing(false);
      };

      workerRef.current.postMessage({ imageBase64: dataUrl });

    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn't read text from this image. Try a clearer photo or type your question instead.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="w-full text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">What do you need to know?</h2>
        <p className="text-lg text-gray-600">Search clinical protocols instantly.</p>
      </div>

      <SearchBar onSearch={handleSearch} isProcessing={isProcessing} />

      <div className="w-full max-w-2xl mt-8">
        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <ImageUpload onImageSelected={processImage} isProcessing={isProcessing} />
        <SampleImages onSampleSelect={processImage} isProcessing={isProcessing} />
      </div>

      {isProcessing && (
        <div className="mt-12 flex flex-col items-center text-teal-600">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
          <p className="font-medium">{loadingMsg}</p>
        </div>
      )}

      {errorMsg && !isProcessing && (
        <div className="mt-8 w-full max-w-2xl bg-red-50 border-l-4 border-red-500 p-4 text-red-700 shadow-sm">
          {errorMsg}
        </div>
      )}

      {warningMsg && !isProcessing && hasSearched && (
        <div className="mt-8 w-full max-w-2xl bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-800 shadow-sm">
          {warningMsg}
        </div>
      )}

      <div className="w-full max-w-3xl">
        <ResultsList results={results} hasSearched={hasSearched} />
      </div>
    </div>
  );
}
