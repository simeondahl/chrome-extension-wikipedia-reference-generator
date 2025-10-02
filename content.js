// Wikipedia Reference Generator - Content Script
// This script runs on all web pages to help extract metadata

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractMetadata') {
        const metadata = extractPageMetadata();
        sendResponse(metadata);
    }
});

function extractPageMetadata() {
    const metadata = {
        title: document.title || '',
        url: window.location.href || '',
        domain: window.location.hostname || '',
        accessDate: new Date().toISOString().split('T')[0]
    };

    // Enhanced author extraction
    const authorSelectors = [
        'meta[name="author"]',
        'meta[property="article:author"]',
        'meta[name="twitter:creator"]',
        'meta[name="dcterms.creator"]',
        '[rel="author"]',
        '.author',
        '.byline',
        '.post-author',
        '.article-author'
    ];

    for (const selector of authorSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            let author = element.content || element.textContent || element.title;
            if (author && author.trim()) {
                // Clean up author name
                author = author.trim().replace(/^By\s+/i, '');
                metadata.author = author;
                break;
            }
        }
    }

    // Enhanced date extraction
    const dateSelectors = [
        'meta[property="article:published_time"]',
        'meta[name="publication_date"]',
        'meta[name="date"]',
        'meta[name="dcterms.created"]',
        'meta[name="dcterms.date"]',
        'time[datetime]',
        '.publish-date',
        '.post-date',
        '.article-date',
        '.date'
    ];

    for (const selector of dateSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            let dateString = element.content || element.dateTime || element.textContent;
            if (dateString) {
                const date = new Date(dateString.trim());
                if (!isNaN(date.getTime())) {
                    metadata.publishDate = date.toISOString().split('T')[0];
                    break;
                }
            }
        }
    }

    // Enhanced publisher/website name extraction
    const publisherSelectors = [
        'meta[property="og:site_name"]',
        'meta[name="application-name"]',
        'meta[property="twitter:site"]',
        'meta[name="publisher"]',
        'meta[name="dcterms.publisher"]'
    ];

    for (const selector of publisherSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            let publisher = element.content;
            if (publisher && publisher.trim()) {
                // Clean up publisher name
                publisher = publisher.trim().replace(/^@/, '');
                metadata.publisher = publisher;
                break;
            }
        }
    }

    // If no publisher found, try to extract from title or domain
    if (!metadata.publisher) {
        // Try to get from domain
        const domain = metadata.domain;
        if (domain) {
            // Convert domain to a readable name
            let siteName = domain.replace(/^www\./, '').split('.')[0];
            siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
            metadata.publisher = siteName;
        }
    }

    // Description extraction
    const descSelectors = [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="dcterms.description"]'
    ];

    for (const selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element && element.content) {
            metadata.description = element.content.trim();
            break;
        }
    }

    // Language extraction
    const lang = document.documentElement.lang ||
        document.querySelector('meta[http-equiv="content-language"]')?.content ||
        document.querySelector('meta[name="language"]')?.content;
    if (lang) {
        metadata.language = lang.split('-')[0]; // Get just the language code (e.g., 'en' from 'en-US')
    }

    // Type detection (news article, blog post, etc.)
    const typeSelectors = [
        'meta[property="og:type"]',
        'meta[name="type"]'
    ];

    for (const selector of typeSelectors) {
        const element = document.querySelector(selector);
        if (element && element.content) {
            metadata.type = element.content;
            break;
        }
    }

    return metadata;
}

// Function to help identify if this is a news article or blog post
function detectContentType() {
    const indicators = {
        news: [
            'article-body',
            'news-article',
            'story-body',
            '.article',
            '[role="article"]'
        ],
        blog: [
            'blog-post',
            'post-content',
            'entry-content',
            '.post',
            '.blog'
        ]
    };

    for (const [type, selectors] of Object.entries(indicators)) {
        for (const selector of selectors) {
            if (document.querySelector(selector)) {
                return type;
            }
        }
    }

    return 'web';
}