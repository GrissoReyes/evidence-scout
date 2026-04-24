import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Sources from './pages/Sources';
import { useEffect, useState } from 'react';
import { loadCorpus } from './lib/tfidf';

function App() {
  const [corpusLoaded, setCorpusLoaded] = useState(false);

  useEffect(() => {
    loadCorpus().then(() => setCorpusLoaded(true));
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          {corpusLoaded ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/sources" element={<Sources />} />
            </Routes>
          ) : (
            <div className="flex items-center justify-center h-64 text-teal-600">
              <span className="text-xl animate-pulse">Loading Evidence Scout...</span>
            </div>
          )}
        </main>
        <footer className="bg-gray-100 border-t py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            For educational reference only. Not clinical advice. Always verify against institutional protocols.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
