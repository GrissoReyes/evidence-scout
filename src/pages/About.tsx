export default function About() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Evidence Scout</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-2">What Evidence Scout Is</h2>
          <p>
            Evidence Scout is a point-of-care clinical reference search tool designed to help floor nurses quickly find evidence-based answers to pressing clinical questions. It is built to be fast, reliable, and privacy-respecting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-2">Who It's For</h2>
          <p>
            It is designed specifically for floor nurses who often face urgent clinical scenarios where rapid access to protocol is critical, but traditional documentation or specialist consults may not be immediately available.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-2">Why It Exists</h2>
          <p>
            Consider a typical scenario: A nurse at 8 PM has a patient post-shoulder ORIF (open reduction internal fixation). There is no PT consult on file, and the surgeon is unreachable. The nurse needs to know how to safely move the patient. Evidence Scout allows them to instantly search trusted guidelines and extract exactly the right excerpt without paging through dense manuals.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-2">Current Scope (Phase 1)</h2>
          <p>
            In its initial release (Phase 1), Evidence Scout's knowledge base is strictly limited to upper-extremity orthopedics (specifically shoulder and elbow protocols). It provides English-only support and focuses exclusively on trusted clinical reference documents for this specialty.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-2">Roadmap to Phase 2</h2>
          <p>
            Future development will expand the corpus to include lower-extremity orthopedics and general post-op care guidelines. Phase 2 will also introduce multi-language support and optimized mobile-native applications, while maintaining our strict local-first privacy architecture.
          </p>
        </section>
      </div>
    </div>
  );
}
