import React from 'react';
import { Search, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="relative">
            <Search className="w-8 h-8 text-blue-200" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Mosanta AI
          </h1>
        </div>
        <p className="text-center text-blue-200 text-lg max-w-2xl mx-auto">
          SEO Content Analyzer
        </p>
      </div>
    </header>
  );
};

export default Header;