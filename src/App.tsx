import React, { useState } from 'react';
import Header from './components/Header';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeContent } from './services/geminiService';
import { extractContentFromUrl } from './services/contentExtractorService';

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

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResults('');
    setAnalyzedUrl(url);
    setExtractedContent(null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
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
  );
}

export default App;