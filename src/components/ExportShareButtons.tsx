import React from 'react';
import { Link } from 'lucide-react';

interface ExportShareButtonsProps {
  results: string;
  url: string;
}

const ExportShareButtons: React.FC<ExportShareButtonsProps> = ({ results, url }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results);
      alert('Analiz sonuçları panoya kopyalandı!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Panoya kopyalama başarısız oldu.');
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Paylaşım linki panoya kopyalandı!');
    } catch (error) {
      console.error('Error copying share link:', error);
      alert('Link kopyalama başarısız oldu.');
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
          title="Metni kopyala"
        >
          <Link className="w-4 h-4" />
          <span className="hidden sm:inline">Kopyala</span>
        </button>
        <button
          onClick={copyShareLink}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
          title="Linki kopyala"
        >
          <Link className="w-4 h-4" />
          <span className="hidden sm:inline">Link</span>
        </button>
      </div>
    </div>
  );
};

export default ExportShareButtons;