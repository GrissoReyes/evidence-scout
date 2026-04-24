import { Search, Cpu, ListChecks } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h1>
      
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="flex-shrink-0 bg-teal-100 p-4 rounded-full text-teal-600">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. You search or upload</h2>
            <p className="text-gray-600 leading-relaxed">
              Type a clinical question directly into the search bar, or take a photo of a printed protocol page using your device's camera.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="flex-shrink-0 bg-teal-100 p-4 rounded-full text-teal-600">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Your device does the work</h2>
            <p className="text-gray-600 leading-relaxed">
              OpenCV.js cleans images, Tesseract.js reads text, and TF-IDF with cosine similarity finds matching reference documents. All of this heavy lifting happens right in your browser.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="flex-shrink-0 bg-teal-100 p-4 rounded-full text-teal-600">
            <ListChecks className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. You get ranked answers</h2>
            <p className="text-gray-600 leading-relaxed">
              In seconds, Evidence Scout provides up to 5 matching answers with source attribution and clickable links for further reading.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm text-gray-600 text-center">
        <p>
          <strong>Privacy Note:</strong> After your first visit, Evidence Scout's core search and image-processing features work offline. Your queries and images never leave your device.
        </p>
      </div>
    </div>
  );
}
