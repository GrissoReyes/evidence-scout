import { Upload } from 'lucide-react';
import React from 'react';

interface Props {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUpload({ onImageSelected, isProcessing }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isProcessing ? 'opacity-50 pointer-events-none' : 'border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">Take a photo of a protocol or document</p>
          </div>
          {/* Real file input, styled cleanly, capture environment for iOS Safari */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 mb-2 cursor-pointer"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>
    </div>
  );
}
