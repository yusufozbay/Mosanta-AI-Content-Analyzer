export interface ExtractedContent {
  title: string;
  content: string;
  url: string;
}

export const extractContentFromUrl = async (url: string): Promise<ExtractedContent> => {
  try {
    // Use CORS proxy to fetch the content
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }

    const htmlContent = await response.text();
    return parseHtmlToMarkdown(htmlContent, url);
  } catch (error) {
    console.error('Error extracting content:', error);
    throw new Error('İçerik çekilirken bir hata oluştu. Lütfen URL\'nin doğru olduğundan emin olun.');
  }
};

const parseHtmlToMarkdown = (html: string, url: string): ExtractedContent => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove unwanted elements first
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.social-share', '.newsletter',
    '.popup', '.modal', '.cookie-banner', '.sidebar',
    '[class*="ad-"]', '[id*="ad-"]', '[class*="advertisement"]',
    '.comments', '.comment-section', '.related-posts',
    '.breadcrumb', '.pagination', '.tags', '.categories',
    '.author-bio', '.share-buttons', '.social-media',
    // Oggusto specific selectors to remove
    '.py-8', '.sticky', '.flex.items-center.font-jost.py-2',
    'nav', 'header', 'footer', '.navigation', '.menu'
  ];

  unwantedSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Extract title - try multiple methods
  let title = '';
  
  // Try to get title from various sources
  const titleSources = [
    'h1',
    '.post-title',
    '.article-title',
    '.entry-title',
    '.title',
    'title'
  ];
  
  for (const selector of titleSources) {
    const titleElement = doc.querySelector(selector);
    if (titleElement && titleElement.textContent?.trim()) {
      title = titleElement.textContent.trim();
      break;
    }
  }
  
  if (!title) {
    title = 'Başlık Bulunamadı';
  }

  // Find main content area with improved selectors for Oggusto
  const contentSelectors = [
    // Oggusto specific selectors
    'body > div.container.relative > div',
    '.container.relative > div',
    // Generic content selectors
    'main',
    'article', 
    '.content', 
    '.post', 
    '.entry',
    '.post-content', 
    '.article-content', 
    '.main-content',
    '[role="main"]',
    '.prose',
    '.text-content'
  ];

  let mainContent: Element | null = null;
  
  for (const selector of contentSelectors) {
    const elements = doc.querySelectorAll(selector);
    
    // Find the element with the most text content
    let bestElement: Element | null = null;
    let maxTextLength = 0;
    
    elements.forEach(el => {
      const textLength = el.textContent?.length || 0;
      if (textLength > maxTextLength) {
        maxTextLength = textLength;
        bestElement = el;
      }
    });
    
    if (bestElement && maxTextLength > 100) { // Minimum content length
      mainContent = bestElement;
      break;
    }
  }

  // If no specific content area found, use body but clean it more
  if (!mainContent) {
    mainContent = doc.body;
    
    // Remove more unwanted elements from body
    const bodyUnwantedSelectors = [
      'nav', 'header', 'footer', 'aside', '.sidebar',
      '.navigation', '.menu', '.breadcrumb', '.pagination'
    ];
    
    bodyUnwantedSelectors.forEach(selector => {
      const elements = mainContent!.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  // Convert to markdown
  const markdown = convertElementToMarkdown(mainContent);

  // Validate that we got meaningful content
  if (markdown.length < 50) {
    throw new Error('Yeterli içerik bulunamadı. Sayfa yapısı desteklenmiyor olabilir.');
  }

  return {
    title,
    content: markdown,
    url
  };
};

const convertElementToMarkdown = (element: Element): string => {
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      // Skip very short text nodes that are likely formatting
      return text.length > 2 ? text : '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    
    // Skip elements that are likely navigation or unwanted content
    const skipClasses = ['nav', 'navigation', 'menu', 'breadcrumb', 'pagination', 'sidebar'];
    const className = el.className.toString().toLowerCase();
    if (skipClasses.some(cls => className.includes(cls))) {
      return '';
    }

    const textContent = el.textContent?.trim() || '';

    // Skip empty elements or very short ones that are likely formatting
    if (!textContent || textContent.length < 3) return '';

    switch (tagName) {
      case 'h1':
        return `\n# ${textContent}\n\n`;
      case 'h2':
        return `\n## ${textContent}\n\n`;
      case 'h3':
        return `\n### ${textContent}\n\n`;
      case 'h4':
        return `\n#### ${textContent}\n\n`;
      case 'h5':
        return `\n##### ${textContent}\n\n`;
      case 'h6':
        return `\n###### ${textContent}\n\n`;
      case 'p':
        const pContent = processChildren(el);
        return pContent ? `\n${pContent}\n\n` : '';
      case 'strong':
      case 'b':
        return `**${textContent}**`;
      case 'em':
      case 'i':
        return `*${textContent}*`;
      case 'code':
        return `\`${textContent}\``;
      case 'pre':
        return `\n\`\`\`\n${textContent}\n\`\`\`\n\n`;
      case 'blockquote':
        const lines = textContent.split('\n').map(line => `> ${line}`).join('\n');
        return `\n${lines}\n\n`;
      case 'ul':
        return `\n${processListItems(el, '-')}\n`;
      case 'ol':
        return `\n${processListItems(el, '1.')}\n`;
      case 'li':
        return processChildren(el);
      case 'a':
        const href = el.getAttribute('href');
        if (href && !href.startsWith('#')) {
          return `[${textContent}](${href})`;
        }
        return textContent;
      case 'img':
        const src = el.getAttribute('src');
        const alt = el.getAttribute('alt') || 'Image';
        if (src) {
          return `![${alt}](${src})`;
        }
        return '';
      case 'table':
        return processTable(el);
      case 'br':
        return '\n';
      case 'hr':
        return '\n---\n\n';
      case 'div':
      case 'section':
      case 'article':
        // For container elements, just process children
        return processChildren(el);
      default:
        return processChildren(el);
    }
  };

  const processChildren = (element: Element): string => {
    let result = '';
    for (const child of element.childNodes) {
      const childResult = processNode(child);
      if (childResult.trim()) {
        result += childResult;
      }
    }
    return result;
  };

  const processListItems = (listElement: Element, marker: string): string => {
    const items = listElement.querySelectorAll('li');
    let result = '';
    items.forEach((item, index) => {
      const itemMarker = marker === '1.' ? `${index + 1}.` : marker;
      const itemText = processChildren(item).trim();
      if (itemText) {
        result += `${itemMarker} ${itemText}\n`;
      }
    });
    return result;
  };

  const processTable = (tableElement: Element): string => {
    const rows = tableElement.querySelectorAll('tr');
    if (rows.length === 0) return '';

    let tableMarkdown = '\n';
    let isFirstRow = true;

    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      if (cells.length === 0) return;

      let rowMarkdown = '|';
      cells.forEach(cell => {
        const cellText = cell.textContent?.trim() || '';
        rowMarkdown += ` ${cellText} |`;
      });
      
      tableMarkdown += rowMarkdown + '\n';

      // Add header separator for first row
      if (isFirstRow) {
        let separator = '|';
        cells.forEach(() => {
          separator += ' --- |';
        });
        tableMarkdown += separator + '\n';
        isFirstRow = false;
      }
    });

    return tableMarkdown + '\n';
  };

  const result = processNode(element)
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .trim();

  return result;
};