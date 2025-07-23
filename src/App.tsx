import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Header';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeContent } from './services/geminiService';
import { extractContentFromUrl } from './services/contentExtractorService';
import { logDailyTokenUsage } from './services/geminiService';

function SharedResult() {
  const { id } = useParams();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/share?id=${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setResult(data.result))
      .catch(() => setError('Paylaşılmış analiz bulunamadı veya süresi doldu.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ResultsDisplay
            results={result || ''}
            isLoading={loading}
            error={error}
            analyzedUrl={''}
            extractedContent={null}
          />
        </div>
      </main>
    </div>
  );
}

function App() {
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string>('');
  const [extractedContent, setExtractedContent] = useState<{
    title: string;
    content: string;
    url: string;
  } | null>(null);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `gemini_token_usage_${today}`;
    setTokenCount(Number(localStorage.getItem(key) || '0'));
  });

  // Add ref for analysis progress section
  const analysisProgressRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResults('');
    setAnalyzedUrl(url);
    setExtractedContent(null);

    // Scroll to progress bar section (red line)
    setTimeout(() => {
      const el = document.getElementById('analysis-progress-bar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    try {
      // First extract content to show preview
      const content = await extractContentFromUrl(url);
      setExtractedContent(content);
      // Then perform full analysis
      const analysis = await analyzeContent(url);
      setResults(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                {/* Show today's token count for debugging */}
                <div className="mb-4 text-center text-green-700 font-bold">
                  Bugünkü Token Count: {tokenCount}
                </div>
                {/* Add id to analysis progress section for scrolling */}
                <div id="analysis-progress-section"></div>
                <ResultsDisplay 
                  results={results} 
                  isLoading={isLoading} 
                  error={error} 
                  analyzedUrl={analyzedUrl}
                  extractedContent={extractedContent}
                />
              </div>
            </main>
            <footer className="bg-gray-800 text-white py-6 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400">
                  © 2025 Mosanta AI
                </p>
              </div>
            </footer>
          </div>
        } />
        <Route path="/share/:id" element={<SharedResult />} />
      </Routes>
    </Router>
  );
}

export default App;