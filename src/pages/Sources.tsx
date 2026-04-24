import { ExternalLink } from 'lucide-react';

export default function Sources() {
  // Using placeholders for the 11 corpus documents per spec.
  const sources = [
    {
      title: "Rotator Cuff Repair Protocol",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Comprehensive post-operative guidelines for rotator cuff repair."
    },
    {
      title: "Elbow Fracture Immobilization",
      org: "MedlinePlus",
      url: "https://medlineplus.gov/",
      desc: "Standard protocols for splinting and immobilizing elbow fractures."
    },
    {
      title: "Shoulder Dislocation Protocol",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Reduction and immobilization guidelines for anterior shoulder dislocations."
    },
    {
      title: "Biceps Tenodesis Restrictions",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Post-surgical restrictions and lifting limits following biceps tenodesis."
    },
    {
      title: "Ulnar Nerve Entrapment Splinting",
      org: "MedlinePlus",
      url: "https://medlineplus.gov/",
      desc: "Night splinting and conservative management for cubital tunnel syndrome."
    },
    {
      title: "Total Shoulder Arthroplasty Precautions",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Range of motion precautions and sling use post shoulder replacement."
    },
    {
      title: "Olecranon Bursitis Wrap",
      org: "MedlinePlus",
      url: "https://medlineplus.gov/",
      desc: "Compression wrapping techniques for acute olecranon bursitis."
    },
    {
      title: "Epicondylitis Strap Placement",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Proper placement and tensioning of counterforce braces for tennis elbow."
    },
    {
      title: "SLAP Lesion Repair Rehab",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Phased rehabilitation guidelines for Superior Labrum from Anterior to Posterior repairs."
    },
    {
      title: "Frozen Shoulder Mobilization",
      org: "MedlinePlus",
      url: "https://medlineplus.gov/",
      desc: "Gentle stretching and mobilization protocols for adhesive capsulitis."
    },
    {
      title: "Radial Head Fracture ROM",
      org: "OrthoInfo",
      url: "https://orthoinfo.aaos.org/",
      desc: "Early active range of motion guidelines for non-displaced radial head fractures."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sources</h1>
      <p className="text-gray-600 mb-8">The Evidence Scout Phase 1 corpus consists of the following 11 reference documents.</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((source, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-semibold text-teal-700 mb-1">{source.title}</h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{source.org}</span>
            <p className="text-sm text-gray-600 mb-4 flex-grow">{source.desc}</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Original Source <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
