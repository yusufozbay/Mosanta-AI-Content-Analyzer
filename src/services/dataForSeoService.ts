const DATAFORSEO_LOGIN = 'yusuf@admonato.com';
const DATAFORSEO_PASSWORD = 'ea73b2041365858f';
const DATAFORSEO_API_URL = 'https://api.dataforseo.com/v3';

interface OrganicResult {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  xpath: string;
  domain: string;
  title: string;
  url: string;
  breadcrumb?: string;
  website_name?: string;
  is_featured_snippet: boolean;
  is_malicious: boolean;
  is_web_story: boolean;
  description: string;
  pre_snippet?: string;
  extended_snippet?: string;
  amp_version: boolean;
  rating?: {
    rating_type: string;
    value: number;
    votes_count: number;
    rating_max: number;
  };
  highlighted: string[];
  links?: {
    type: string;
    title: string;
    description?: string;
    url: string;
  }[];
  about_this_result?: {
    type: string;
    url: string;
    source: string;
    source_info: string;
    source_url: string;
  };
  related_result?: {
    type: string;
    url: string;
  }[];
  timestamp?: string;
  rectangle?: any;
}

interface SerpResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: {
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: {
      api: string;
      function: string;
      se: string;
      se_type: string;
      language_code: string;
      location_code: number;
      keyword: string;
      device: string;
      os: string;
    };
    result: {
      keyword: string;
      type: string;
      se_domain: string;
      location_code: number;
      language_code: string;
      check_url: string;
      datetime: string;
      spell?: any;
      refinement_chips?: any;
      item_types: string[];
      se_results_count: number;
      items_count: number;
      items: OrganicResult[];
    }[];
  }[];
}

export interface CompetitorData {
  domain: string;
  url: string;
  title: string;
  description: string;
  rank: number;
  content?: string;
}

const getAuthHeader = (): string => {
  const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);
  return `Basic ${credentials}`;
};

const extractKeywordFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract potential keywords from URL path
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Clean up the segment (remove file extensions, replace hyphens/underscores with spaces)
    const keyword = lastSegment
      .replace(/\.(html|htm|php|asp|aspx)$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
    
    return keyword || 'content analysis';
  } catch {
    return 'content analysis';
  }
};

export const getCompetitors = async (targetUrl: string): Promise<CompetitorData[]> => {
  try {
    const keyword = extractKeywordFromUrl(targetUrl);
    
    const requestBody = [
      {
        language_code: "tr",
        location_code: 2792,
        keyword: keyword,
        device: "desktop",
        os: "windows",
        depth: 10
      }
    ];

    const response = await fetch(`${DATAFORSEO_API_URL}/serp/google/organic/live/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    const data: SerpResponse = await response.json();
    
    if (!data.tasks || data.tasks.length === 0 || !data.tasks[0].result) {
      throw new Error('No SERP results found');
    }

    const serpResults = data.tasks[0].result[0];
    if (!serpResults || !serpResults.items) {
      throw new Error('No organic results found');
    }

    // Filter organic results and get top 10
    const organicResults = serpResults.items
      .filter((item: OrganicResult) => item.type === 'organic')
      .slice(0, 10)
      .map((item: OrganicResult): CompetitorData => ({
        domain: item.domain,
        url: item.url,
        title: item.title,
        description: item.description,
        rank: item.rank_absolute
      }));

    return organicResults;
  } catch (error) {
    console.error('Error fetching competitors:', error);
    throw error;
  }
};

export const fetchCompetitorContent = async (url: string): Promise<string> => {
  try {
    // Try multiple CORS proxy services for better reliability
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];
    
    let htmlContent = '';
    let lastError = null;
    
    // Try each proxy service until one works
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.text();
          htmlContent = data;
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    // If all proxies failed, return a fallback message
    if (!htmlContent) {
      console.warn(`All CORS proxies failed for ${url}:`, lastError);
      return `Content from ${new URL(url).hostname} could not be fetched due to CORS restrictions. This is a common limitation when accessing external websites directly from the browser.`;
    }
    
    // Extract text content from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.remove());
    
    // Get main content
    const mainContent = doc.querySelector('main, article, .content, .post, .entry') || doc.body;
    const textContent = mainContent?.textContent || '';
    
    // Clean and limit content
    return textContent
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000); // Limit to 3000 characters
      
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    const domain = new URL(url).hostname;
    return `Content from ${domain} could not be fetched due to network restrictions. This is a common limitation when accessing external websites directly from the browser.`;
  }
};