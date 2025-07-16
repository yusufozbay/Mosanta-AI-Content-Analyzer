import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  analysisResults: string;
  analyzedUrl: string;
  extractedContent?: {
    title: string;
    content: string;
    url: string;
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  analysisResults, 
  analyzedUrl, 
  extractedContent 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyBT5sxoLqCKH-8kTUt3hZBRdo2UtgqZjKM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
            text: `Sen Mosanta AI'ın SEO uzmanı asistanısın. Aşağıdaki analiz sonuçları ve SADECE BU URL'DEN ÇEKILEN içerik hakkında kullanıcının sorularını yanıtla.

ANALIZ EDILEN URL: ${analyzedUrl}

ANALIZ SONUÇLARI:
${analysisResults}

${extractedContent ? `
BU URL'DEN ÇEKILEN GERÇEK İÇERİK (${extractedContent.url}):
Başlık: ${extractedContent.title}
İçerik: ${extractedContent.content.substring(0, 3000)}...
` : ''}

KULLANICI SORUSU: ${content}

ÖNEMLI: Sadece yukarıda verilen URL'den çekilen içerik hakkında konuş. Başka bir sayfadan bahsetme. Yanıtın Türkçe olsun ve SEO odaklı, pratik öneriler içersin.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Chat response failed');
      }

      const data = await response.json();
      const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Üzgünüm, bir hata oluştu.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const suggestedQuestions = [
    "Bu analizde en önemli eksiklik nedir?",
    "Rakiplerimden nasıl öne geçebilirim?",
    "İçeriğimi nasıl optimize edebilirim?",
    "Hangi anahtar kelimelere odaklanmalıyım?",
    "E-A-T skorumu nasıl artırabilirim?"
  ];

  if (!analysisResults) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center space-x-2"
          title="Analiz hakkında soru sor"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              <span className="hidden sm:inline text-sm font-medium">Soru Sor</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">Mosanta AI Asistan</h3>
            </div>
            <p className="text-blue-100 text-sm mt-1">Analiz hakkında sorularınızı sorun</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm mb-4">Analiz sonuçları hakkında soru sorabilirsiniz</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">Örnek sorular:</p>
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(question)}
                      className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded border text-gray-700 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {message.type === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="text-sm mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc ml-4 text-sm space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-4 text-sm space-y-1">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            code: ({ children }) => <code className="bg-gray-200 px-1 rounded text-xs">{children}</code>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Düşünüyor...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Sorunuzu yazın..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            {messages.length === 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestedQuestions.slice(3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;