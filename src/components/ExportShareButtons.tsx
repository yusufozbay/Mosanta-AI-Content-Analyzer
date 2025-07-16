import React from 'react';
import { Download, Share2, Twitter, Linkedin, Facebook, Link } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportShareButtonsProps {
  results: string;
  url: string;
}

const ExportShareButtons: React.FC<ExportShareButtonsProps> = ({ results, url }) => {
  const generatePDF = async () => {
    const element = document.getElementById('analysis-results');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add title page
      pdf.setFontSize(20);
      pdf.text('Mosanta AI - SEO Analysis Report', 20, 30);
      pdf.setFontSize(12);
      pdf.text(`Analyzed URL: ${url}`, 20, 45);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('tr-TR')}`, 20, 55);
      pdf.text('Powered by Mosanta AI', 20, 65);
      
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`seo-analysis-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results);
      alert('Analiz sonuçları panoya kopyalandı!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Panoya kopyalama başarısız oldu.');
    }
  };

  const shareOnTwitter = () => {
    const text = `SEO Content Analysis completed for ${url} using Mosanta AI 🚀\n\nKey insights and recommendations generated! #MosantaAI #SEO #ContentAnalysis #AI`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const text = `Just completed a comprehensive SEO content analysis for ${url} using Mosanta AI. The insights are game-changing for content optimization! #MosantaAI #SEO #ContentStrategy #DigitalMarketing`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`SEO Content Analysis for ${url} - Powered by Mosanta AI`)}`;
    window.open(facebookUrl, '_blank');
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
      {/* Export Options */}
      <div className="flex items-center space-x-2">
        <button
          onClick={generatePDF}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          title="PDF olarak indir"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">PDF İndir</span>
        </button>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
          title="Metni kopyala"
        >
          <Link className="w-4 h-4" />
          <span className="hidden sm:inline">Kopyala</span>
        </button>
      </div>

      {/* Social Media Sharing */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Paylaş:</span>
        </div>
        
        <button
          onClick={shareOnTwitter}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
          title="Twitter'da paylaş"
        >
          <Twitter className="w-4 h-4" />
          <span className="hidden sm:inline">Twitter</span>
        </button>
        
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
          title="LinkedIn'de paylaş"
        >
          <Linkedin className="w-4 h-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </button>
        
        <button
          onClick={shareOnFacebook}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          title="Facebook'ta paylaş"
        >
          <Facebook className="w-4 h-4" />
          <span className="hidden sm:inline">Facebook</span>
        </button>
        
        <button
          onClick={copyShareLink}
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
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