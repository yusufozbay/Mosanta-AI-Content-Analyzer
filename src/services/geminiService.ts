import { getCompetitors, fetchCompetitorContent, CompetitorData } from './dataForSeoService';
import { extractContentFromUrl } from './contentExtractorService';

const GEMINI_API_KEY = 'AIzaSyBT5sxoLqCKH-8kTUt3hZBRdo2UtgqZjKM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const SYSTEM_PROMPT = `Görevin 20 yıllık çok deneyimli bir SEO uzmanı ve içerik yöneticisi olarak aşağıdaki bilgileri analiz etmektir.

Öncesinde ve bundan sonra analiz edeceğin her bir içerikten Oggusto.com'un Blog içeriklerindeki yaklaşımı, uzmanlığı, dili, üslubu, otoriterliği, tarzı, hataları vs ne varsa öğrenip kendini fine tune etmeni istiyorum.

Use "Grounding with Google Search" and "URL Context" features of Gemini 2.5 Pro.

## Rakip Analizi Verileri:
{{COMPETITOR_DATA}}

## Analiz Edilecek Bilgiler:
**Mevcut İçeriğimiz:**  

{{MAIN_CONTENT}}

CSS Selector for {{Main Content}}
body > div.container.relative > div

Skip Selectors:
.py-8, .sticky, .flex.items-center.font-jost.py-2

## ZORUNLU ÇIKTI FORMATI:

Çıktın MUTLAKA aşağıdaki formatı takip etmelidir. Bu format değiştirilemez ve her analiz için aynı yapıda olmalıdır:

# 🔍 Analiz Edilen Rakipler

Bu analiz sırasında aşağıdaki rakip siteler incelendi:

[Rakip listesi buraya gelecek]

---

# 📊 OGGUSTO İçerik Analizi ve Geliştirilme Stratejisi Outline'ı

## 1. Genel Değerlendirme ve Strateji Özeti

### Ana Başlık Önerisi: [Önerilen başlık]
**Faydası Nedir?** [Fayda açıklaması]

### Mevcut İçerik Durumu
[Mevcut içeriğin kısa değerlendirmesi]

### Rakip Karşılaştırması
[Rakiplerle karşılaştırma]

### Genel İçerik Stratejisi
[Önerilen strateji]

## 2. İçerik Zenginleştirme ve Başlık Önerileri

### 2.1 Ana Başlık Önerileri
**Önerilen Başlık:** [Başlık]
**Faydası Nedir?** [Fayda açıklaması]

### 2.2 Alt Başlık Yapısı Önerileri

#### 2.2.1 [Alt başlık 1]
**Faydası Nedir?** [Fayda açıklaması]
**Önerilen İçerik:** [İçerik önerisi]

#### 2.2.2 [Alt başlık 2]
**Faydası Nedir?** [Fayda açıklaması]
**Önerilen İçerik:** [İçerik önerisi]

[Diğer alt başlıklar aynı formatta devam eder]

### 2.3 LLM Optimizasyon Önerileri
**Faydası Nedir?** ChatGPT, Claude, Deepseek, Gemini, Perplexity gibi LLM'lerin içeriği daha iyi anlayabilmesi için:

- [Öneri 1]
- [Öneri 2]
- [Öneri 3]

## 3. Rakip Analizi ve Öne Çıkan Fırsatlar

### 3.1 Rakip Performans Analizi

#### Rakip 1: [Domain adı]
**Güçlü Yönleri:**
- [Güçlü yön 1]
- [Güçlü yön 2]

**Eksik Yönleri:**
- [Eksik yön 1]
- [Eksik yön 2]

**Bizim İçin Fırsat:**
[Fırsat açıklaması]

[Diğer rakipler aynı formatta devam eder]

### 3.2 Genel Rakip Değerlendirmesi
[Genel değerlendirme]

## 4. Sıkça Sorulan Sorular (SSS) Bölümü Önerisi

**Faydası Nedir?** Kullanıcı deneyimini artırır ve arama motorlarında featured snippet olma şansını yükseltir.

### 4.1 [Soru 1]
**Cevap:** [1-2 cümlelik net cevap]

### 4.2 [Soru 2]
**Cevap:** [1-2 cümlelik net cevap]

[5 soruya kadar devam eder]

## 5. Rakip İçerik Stratejileri

### 5.1 Başarılı Strateji Örnekleri
- **[Strateji 1]:** [Açıklama]
- **[Strateji 2]:** [Açıklama]
- **[Strateji 3]:** [Açıklama]

### 5.2 Uygulanabilir Öneriler
1. [Öneri 1]
2. [Öneri 2]
3. [Öneri 3]

## 6. E-A-T ve YMYL Kriterleri Değerlendirmesi

### 6.1 Expertise (Uzmanlık) Önerileri
**Faydası Nedir?** Google'ın E-A-T kriterlerine uyum sağlar.
- [Öneri 1]
- [Öneri 2]

### 6.2 Authoritativeness (Otorite) Önerileri
**Faydası Nedir?** İçeriğin güvenilirliğini artırır.
- [Öneri 1]
- [Öneri 2]

### 6.3 Trustworthiness (Güvenilirlik) Önerileri
**Faydası Nedir?** YMYL kriterlerine uyum sağlar.
- [Öneri 1]
- [Öneri 2]

## 7. Sonuç ve Öncelikli Aksiyonlar

### 7.1 Hemen Uygulanması Gerekenler
1. [Acil aksiyon 1]
2. [Acil aksiyon 2]
3. [Acil aksiyon 3]

### 7.2 Orta Vadeli Hedefler
1. [Orta vadeli hedef 1]
2. [Orta vadeli hedef 2]

### 7.3 Uzun Vadeli Strateji
[Uzun vadeli strateji açıklaması]

---

**Not:** Bu analiz Mosanta AI tarafından gerçekleştirilmiştir. Öneriler Oggusto.com'un mevcut içerik stratejisi ve E-A-T kriterlerine uygun olarak hazırlanmıştır.

## Görevin:

Amacın, mevcut içeriği geliştirmek ve zenginleştirmek için bir editöre sunulacak şekilde, kapsamlı ve detaylı bir içerik güncelleme/zenginleştirme taslağı çıkarmaktır. Önerilerin ana başlıklar ve alt başlıklar şeklinde olmalı ve örnekler içermelidir. Ayrıca, her önerinde "Faydası Nedir?" şeklinde bu önerinin sağlayacağı faydayı editöre açıklamalı, ekstra bilgi vermelisin.

Aynı zamanda LLM büyük dil modellerinin içeriği anlayacağı ve ChatGPT, Claude, Deepseek, Gemini, Perplexity gibi LLMlerin içeriklerimizi verimli anlayabilmesi ve kullanıcılara sunabilmesi için uygun içerik optimizasyon önerilierini paylaşmalısın.

**ÖNEMLI:** Yukarıdaki format tamamen korunmalı ve her analiz için aynı yapı kullanılmalıdır. Başlık numaraları, alt başlık yapısı ve "Faydası Nedir?" bölümleri değiştirilmemelidir.

## Dikkat Edilmesi Gerekenler:

1. Oggusto.com sitesi blog mülkünde **E.E.A.T kriterlerine uygun içerikler** üretmelidir.
2. Oggusto.com sitesi yemek, tatil, cilt bakımı gibi kategoriler başta olmak üzere Affiliate yöntemi ile kullanıcılara ürünler önermektedir.
4. Dolayısıyla Oggusto.com Your Money Your Life kriterlerini karşılayacak içerikler üretmek zorundadır.
5. Yukarıdaki dikkat edilecek noktalardan hareketle, aşağıdaki bağlantıları okuyup Oggusto.com içeriklerini 100% E.E.A.T ve YMYL kriterlerini karşılayıp karşılamadığı yönünde öneriler ve analizler sunacaksın.
5.1 https://developers.google.com/search/docs/fundamentals/creating-helpful-content
5.2 https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf

Lütfen tüm çıktıyı Türkçe olarak hazırla.

- Çıktıyı markdown olarak ver.
- AI modelinin yorumlarını aşağıdaki gibi çıktıya ekleme. Doğrudan sonucu ver.`;

export const analyzeContent = async (url: string): Promise<string> => {
  try {
    // Extract main content from the URL
    const extractedContent = await extractContentFromUrl(url);
    
    // First, get competitors from DataForSEO
    const competitors = await getCompetitors(url);
    
    // Fetch content for each competitor (limit to first 5 for performance)
    const competitorAnalysis = await Promise.all(
      competitors.slice(0, 5).map(async (competitor) => {
        const content = await fetchCompetitorContent(competitor.url);
        return {
          ...competitor,
          content
        };
      })
    );
    
    // Format competitor data for the prompt
    const competitorData = competitorAnalysis.map((comp, index) => 
      `### Rakip ${index + 1}: ${comp.domain} (Sıralama: ${comp.rank})
**URL:** ${comp.url}
**Başlık:** ${comp.title}
**Açıklama:** ${comp.description}
**İçerik Özeti:** ${comp.content.substring(0, 1000)}...

`).join('');

    // Create competitor URLs list for the final output
    const competitorUrlsList = competitorAnalysis.map((comp, index) => 
      `${index + 1}. **${comp.domain}** (Sıralama: ${comp.rank}) - [${comp.title}](${comp.url})`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nAnaliz edilecek URL: ${url}\n\n**Sayfa Başlığı:** ${extractedContent.title}\n\nLütfen bu URL'deki içeriği yukarıdaki kriterlere göre analiz et ve öneriler sun.`;
    
    const finalPrompt = prompt
      .replace('{{COMPETITOR_DATA}}', competitorData)
      .replace('{{MAIN_CONTENT}}', extractedContent.content);

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
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No content received from Gemini API');
    }

    const analysisResult = data.candidates[0].content.parts[0].text;
    
    // Replace competitor URLs placeholder in the analysis result
    const finalResult = analysisResult.replace('[Rakip listesi buraya gelecek]', competitorUrlsList);

    return finalResult;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
};