import { extractContentFromUrl } from './contentExtractorService';
import promptText from '../../prompt.txt?raw';

interface CompetitorData {
  domain: string;
  url: string;
  title: string;
  description: string;
  rank: number;
  content?: string;
}

const GEMINI_API_KEY = 'AIzaSyBT5sxoLqCKH-8kTUt3hZBRdo2UtgqZjKM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

const SYSTEM_PROMPT = promptText;

// New: Fetch competitors using SerpApi
const getCompetitorsFromSerpApi = async (targetUrl: string): Promise<CompetitorData[]> => {
  try {
    // Extract keyword from the H1 of the page (or fallback to last URL segment)
    const extracted = await extractContentFromUrl(targetUrl);
    const h1 = extracted.title || '';
    // Call the Netlify function instead of SerpApi directly
    const response = await fetch('/.netlify/functions/serpapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: h1 })
    });
    if (!response.ok) throw new Error('SerpApi error');
    const data = await response.json();
    if (!data.organic_results) throw new Error('No SERP results found');
    const inputDomain = (new URL(targetUrl)).hostname.replace(/^www\./, '');
    // Filter out the analyzed domain from competitors
    const competitors = data.organic_results
      .filter((item: any) => {
        if (!item.link) return false;
        try {
          const resultDomain = (new URL(item.link)).hostname.replace(/^www\./, '');
          return resultDomain !== inputDomain;
        } catch {
          return false;
        }
      })
      .slice(0, 10); // Take up to 10 competitors
    // Proceed with however many competitors are available
    if (competitors.length === 0) {
      throw new Error('No competitors could be found from SERP.');
    }
    const competitorList = competitors.map((item: any, idx: number): CompetitorData => ({
      domain: (new URL(item.link)).hostname,
      url: item.link,
      title: item.title || '',
      description: item.snippet || '',
      rank: idx + 1
    }));
    return competitorList;
  } catch (error) {
    console.error('Error fetching competitors from SerpApi:', error);
    throw error;
  }
};

// Track token usage in localStorage (for demo; use a DB for production)
function addTokenUsage(count: number) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `gemini_token_usage_${today}`;
  const prev = Number(localStorage.getItem(key) || '0');
  localStorage.setItem(key, String(prev + count));
}

export function getTodayTokenCount() {
  const today = new Date().toISOString().slice(0, 10);
  const key = `gemini_token_usage_${today}`;
  return Number(localStorage.getItem(key) || '0');
}

// At the end of the day, send the total to the Netlify function
export async function logDailyTokenUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const key = `gemini_token_usage_${today}`;
  const tokenCount = Number(localStorage.getItem(key) || '0');
  if (tokenCount > 0) {
    await fetch('/.netlify/functions/logTokensToSheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, tokenCount })
    });
    localStorage.removeItem(key);
  }
}

export const analyzeContent = async (url: string): Promise<string> => {
  try {
    // Extract main content from the URL
    const extractedContent = await extractContentFromUrl(url);
    // Get competitors from SerpApi (not DataForSEO)
    const competitors = await getCompetitorsFromSerpApi(url);
    // Fetch content for each competitor (use all 10 for analysis)
    const competitorAnalysis = await Promise.all(
      competitors.map(async (competitor) => {
        // Optionally, fetch content for each competitor if needed (or skip for now)
        return {
          ...competitor,
          content: '' // Not fetching full content for now
        };
      })
    );
    // Format competitor data for the prompt
    const competitorData = competitorAnalysis.map((comp, index) => 
      `### Rakip ${index + 1}: ${comp.domain} (Sıralama: ${comp.rank})\n**URL:** ${comp.url}\n**Başlık:** ${comp.title}\n**Açıklama:** ${comp.description}\n**İçerik Özeti:** ${comp.content?.substring(0, 1000) || ''}...\n\n`).join('');
    // Create competitor URLs list for the final output
    const competitorUrlsList = competitorAnalysis.map((comp, index) => 
      `${index + 1}. **${comp.domain}** (Sıralama: ${comp.rank}) - [${comp.title}](${comp.url})`
    ).join('\n');
    const competitorsList = competitors.map(c => c.url).join('\n');
    const finalPrompt = SYSTEM_PROMPT
      .replace(/{{\s*\$json\['Main Content'\]\s*}}/g, extractedContent.content)
      .replace(/{{\s*\$json\['Organic Result'\]\s*}}/g, competitorsList)
      .replace(/\{input_url\}/g, url);
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: finalPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    const data = await response.json();
    console.log('Gemini API response:', data);
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No content received from Gemini API');
    }
    const analysisResult = data.candidates[0].content.parts[0].text;
    // Replace competitor URLs placeholder in the analysis result
    const finalResult = analysisResult.replace('[Rakip listesi buraya gelecek]', competitorUrlsList);
    // After receiving Gemini API response, add token usage and update UI
    if (data.usageMetadata && typeof data.usageMetadata.totalTokenCount === 'number') {
      addTokenUsage(data.usageMetadata.totalTokenCount);
      // Update UI immediately (for React, trigger a custom event)
      window.dispatchEvent(new Event('tokenCountUpdated'));
      await logDailyTokenUsage();
    }
    return finalResult;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
};