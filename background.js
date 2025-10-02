// Wikipedia Reference Generator - Background Script
// Updated for Manifest V3

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-wiki-ref",
    title: "Generate Wikipedia Citation",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-wiki-ref") {
    generateWikipediaReference(tab);
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReference") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        generateWikipediaReference(tabs[0]);
      }
    });
  }
});

async function generateWikipediaReference(tab) {
  try {
    // Get user options
    const options = await chrome.storage.sync.get({
      includeAccessDate: true,
      autoDetectNews: true,
      includeLanguage: true,
      defaultAuthor: '',
      multilineFormat: true
    });

    // Inject content script to extract page metadata
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageMetadata
    });

    if (results && results[0] && results[0].result) {
      const metadata = results[0].result;

      // Apply user options to metadata
      if (options.defaultAuthor && !metadata.author) {
        metadata.author = options.defaultAuthor;
      }

      const template = generateWikipediaTemplateWithOptions(metadata, options);

      // Store the template for the popup to retrieve
      await chrome.storage.local.set({
        lastTemplate: template,
        lastMetadata: metadata
      });

      // Notify popup if it's open
      chrome.runtime.sendMessage({
        action: "templateGenerated",
        template: template,
        metadata: metadata
      }).catch(() => {
        // Popup might not be open, that's fine
      });
    }
  } catch (error) {
    console.error("Error generating reference:", error);
  }
}

// Function to inject into page context for metadata extraction
function extractPageMetadata() {
  const metadata = {
    title: document.title || '',
    url: window.location.href || '',
    domain: window.location.hostname || '',
    accessDate: new Date().toISOString().split('T')[0]
  };

  // Try to extract author information
  const authorMeta = document.querySelector('meta[name="author"]') ||
    document.querySelector('meta[property="article:author"]') ||
    document.querySelector('meta[name="twitter:creator"]');
  if (authorMeta) {
    metadata.author = authorMeta.content;
  }

  // Try to extract publication date
  const dateMeta = document.querySelector('meta[property="article:published_time"]') ||
    document.querySelector('meta[name="publication_date"]') ||
    document.querySelector('meta[name="date"]') ||
    document.querySelector('time[datetime]');
  if (dateMeta) {
    let dateContent = dateMeta.content || dateMeta.dateTime || dateMeta.textContent;
    if (dateContent) {
      const date = new Date(dateContent);
      if (!isNaN(date.getTime())) {
        metadata.publishDate = date.toISOString().split('T')[0];
      }
    }
  }

  // Try to extract publisher/website name
  const publisherMeta = document.querySelector('meta[property="og:site_name"]') ||
    document.querySelector('meta[name="application-name"]') ||
    document.querySelector('meta[property="twitter:site"]');
  if (publisherMeta) {
    metadata.publisher = publisherMeta.content;
  }

  // Try to extract description
  const descMeta = document.querySelector('meta[name="description"]') ||
    document.querySelector('meta[property="og:description"]') ||
    document.querySelector('meta[name="twitter:description"]');
  if (descMeta) {
    metadata.description = descMeta.content;
  }

  // Try to extract language
  const langAttr = document.documentElement.lang ||
    document.querySelector('meta[http-equiv="content-language"]')?.content;
  if (langAttr) {
    metadata.language = langAttr;
  }

  return metadata;
}

function generateWikipediaTemplateWithOptions(metadata, options) {
  // Clean up the title - remove site name if it appears at the end
  let cleanTitle = metadata.title;
  if (metadata.publisher && cleanTitle.includes(metadata.publisher)) {
    // Remove common patterns like " - Site Name" or " | Site Name"
    cleanTitle = cleanTitle.replace(new RegExp(`\\s*[-|]\\s*${metadata.publisher}.*$`, 'i'), '');
  }

  // Determine template type based on options and content
  const isNews = options.autoDetectNews && isNewsArticle(metadata);
  const templateType = isNews ? 'cite news' : 'cite web';

  // Generate the Wikipedia template
  let template = `{{${templateType}`;

  if (options.multilineFormat) {
    template += "\n";

    if (cleanTitle) {
      template += ` |title=${cleanTitle}\n`;
    }

    template += ` |url=${metadata.url}\n`;

    if (metadata.author) {
      template += ` |author=${metadata.author}\n`;
    }

    if (metadata.publisher) {
      const publisherParam = isNews ? 'newspaper' : 'website';
      template += ` |${publisherParam}=${metadata.publisher}\n`;
    }

    if (metadata.publishDate) {
      template += ` |date=${metadata.publishDate}\n`;
    }

    if (options.includeAccessDate) {
      template += ` |access-date=${metadata.accessDate}\n`;
    }

    if (options.includeLanguage && metadata.language && metadata.language !== 'en') {
      template += ` |language=${metadata.language}\n`;
    }

    template += "}}";
  } else {
    // Single line format
    const params = [];

    if (cleanTitle) params.push(`title=${cleanTitle}`);
    params.push(`url=${metadata.url}`);
    if (metadata.author) params.push(`author=${metadata.author}`);
    if (metadata.publisher) {
      const publisherParam = isNews ? 'newspaper' : 'website';
      params.push(`${publisherParam}=${metadata.publisher}`);
    }
    if (metadata.publishDate) params.push(`date=${metadata.publishDate}`);
    if (options.includeAccessDate) params.push(`access-date=${metadata.accessDate}`);
    if (options.includeLanguage && metadata.language && metadata.language !== 'en') {
      params.push(`language=${metadata.language}`);
    }

    template += ` |${params.join(' |')}}}`;
  }

  return template;
}

function isNewsArticle(metadata) {
  if (metadata.type && metadata.type.includes('article')) {
    return true;
  }

  const newsIndicators = [
    'news', 'reuters', 'cnn', 'bbc', 'associated press', 'ap news',
    'npr', 'fox news', 'abc news', 'cbs news', 'nbc news', 'guardian',
    'times', 'post', 'journal', 'herald', 'tribune', 'gazette'
  ];

  const domain = metadata.domain?.toLowerCase() || '';
  const publisher = metadata.publisher?.toLowerCase() || '';

  return newsIndicators.some(indicator =>
    domain.includes(indicator) || publisher.includes(indicator)
  );
}

