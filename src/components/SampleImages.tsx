interface Props {
  onSampleSelect: (url: string) => void;
  isProcessing: boolean;
}

export default function SampleImages({ onSampleSelect, isProcessing }: Props) {
  const samples = [
    { label: 'Sample 1', url: '/samples/sample1.jpg.jpeg' },
    { label: 'Sample 2', url: '/samples/sample2.jpg.jpeg' }
  ];

  return (
    <div className="mt-4 flex flex-col items-center">
      <p className="text-xs text-gray-500 mb-2">Or try a sample image:</p>
      <div className="flex space-x-3">
        {samples.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => onSampleSelect(sample.url)}
            disabled={isProcessing}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
