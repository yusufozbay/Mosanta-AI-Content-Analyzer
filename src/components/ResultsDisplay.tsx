import React from 'react';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ExportShareButtons from './ExportShareButtons';
import ChatInterface from './ChatInterface';

interface ResultsDisplayProps {
  results: string;
  isLoading: boolean;
  error: string | null;
  analyzedUrl?: string;
  extractedContent?: {
    title: string;
    content: string;
    url: string;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error, analyzedUrl = '', extractedContent }) => {

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Rakipler tespit ediliyor...</span>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">1. İçerik çekiliyor</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">2. Anahtar kelime analizi</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">3. SERP rakipleri tespit ediliyor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">4. Rakip içerikleri analiz ediliyor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-600">5. AI ile kapsamlı analiz</span>
            </div>
          </div>
          
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-semibold text-red-800">Analysis Error</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200 p-12 text-center">
        <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Gelişmiş Rakip Analizi Hazır</h3>
        <p className="text-gray-500 mb-4">Yukarıya bir URL girin ve AI ile kapsamlı rakip analizi alın</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Rakip Tespiti</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>AI Analizi</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Rakip Analizi</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h3 className="text-2xl font-semibold text-gray-800">Analysis Results</h3>
        </div>
      </div>

      <ExportShareButtons results={results} url={analyzedUrl} />

      {extractedContent && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Çekilen İçerik Önizlemesi
          </h4>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h5 className="font-semibold text-gray-900 mb-2">Sayfa Başlığı:</h5>
            <p className="text-gray-800 mb-4">{extractedContent.title}</p>
            
            <h5 className="font-semibold text-gray-900 mb-2">İçerik Özeti:</h5>
            <div className="max-h-40 overflow-y-auto text-sm text-gray-700 bg-gray-50 p-3 rounded border">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h6 className="font-bold text-sm mb-1">{children}</h6>,
                  h2: ({ children }) => <h6 className="font-bold text-sm mb-1">{children}</h6>,
                  h3: ({ children }) => <h6 className="font-semibold text-sm mb-1">{children}</h6>,
                  p: ({ children }) => <p className="text-xs mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 text-xs">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 text-xs">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {extractedContent.content.substring(0, 1000) + (extractedContent.content.length > 1000 ? '...' : '')}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700">
        <div id="analysis-results" className="bg-gray-50 rounded-lg p-6 border border-gray-200 markdown-content">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-200">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8 pb-2 border-b border-gray-300">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-gray-800 mb-4 leading-relaxed text-base">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-6 text-gray-800 mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-6 text-gray-800 mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-800 mb-1 leading-relaxed">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-800">
                  {children}
                </em>
              ),
              code: ({ children }) => (
                <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono text-blue-900 border">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-6 py-3 bg-blue-50 text-gray-800 italic mb-6 rounded-r">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-gray-300 my-6" />
              ),
            }}
          >
            {results}
          </ReactMarkdown>
        </div>
      </div>

      <ChatInterface 
        analysisResults={results}
        analyzedUrl={analyzedUrl}
        extractedContent={extractedContent}
      />
    </div>
  );
};

export default ResultsDisplay;