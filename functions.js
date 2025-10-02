// Wikipedia Reference Generator - Utility Functions

/**
 * Generates a Wikipedia citation template from extracted metadata
 * @param {Object} metadata - The extracted page metadata
 * @returns {string} - The formatted Wikipedia citation template
 */
function generateWikipediaTemplate(metadata) {
    // Clean up the title - remove site name if it appears at the end
    let cleanTitle = cleanTitle = cleanPageTitle(metadata.title, metadata.publisher);

    // Generate the appropriate Wikipedia template based on content type
    let template = '';

    if (isNewsArticle(metadata)) {
        template = generateNewsTemplate(metadata, cleanTitle);
    } else {
        template = generateWebTemplate(metadata, cleanTitle);
    }

    return template;
}

/**
 * Cleans up page title by removing redundant site name
 * @param {string} title - Original page title
 * @param {string} publisher - Publisher/site name
 * @returns {string} - Cleaned title
 */
function cleanPageTitle(title, publisher) {
    if (!title) return '';

    let cleanTitle = title;

    if (publisher && cleanTitle.includes(publisher)) {
        // Remove common patterns like " - Site Name", " | Site Name", " :: Site Name"
        const patterns = [
            new RegExp(`\\s*[-|::]\\s*${escapeRegex(publisher)}.*$`, 'i'),
            new RegExp(`^${escapeRegex(publisher)}\\s*[-|::]\\s*`, 'i')
        ];

        for (const pattern of patterns) {
            cleanTitle = cleanTitle.replace(pattern, '');
        }
    }

    return cleanTitle.trim();
}

/**
 * Escapes special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determines if the content appears to be a news article
 * @param {Object} metadata - Page metadata
 * @returns {boolean} - True if appears to be news content
 */
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

/**
 * Generates a cite news template for news articles
 * @param {Object} metadata - Page metadata
 * @param {string} cleanTitle - Cleaned page title
 * @returns {string} - Formatted cite news template
 */
function generateNewsTemplate(metadata, cleanTitle) {
    let template = "{{cite news\n";

    if (cleanTitle) {
        template += ` |title=${cleanTitle}\n`;
    }

    template += ` |url=${metadata.url}\n`;

    if (metadata.author) {
        template += ` |author=${metadata.author}\n`;
    }

    if (metadata.publisher) {
        template += ` |newspaper=${metadata.publisher}\n`;
    }

    if (metadata.publishDate) {
        template += ` |date=${metadata.publishDate}\n`;
    }

    template += ` |access-date=${metadata.accessDate}\n`;

    if (metadata.language && metadata.language !== 'en') {
        template += ` |language=${metadata.language}\n`;
    }

    template += "}}";

    return template;
}

/**
 * Generates a cite web template for general web content
 * @param {Object} metadata - Page metadata
 * @param {string} cleanTitle - Cleaned page title
 * @returns {string} - Formatted cite web template
 */
function generateWebTemplate(metadata, cleanTitle) {
    let template = "{{cite web\n";

    if (cleanTitle) {
        template += ` |title=${cleanTitle}\n`;
    }

    template += ` |url=${metadata.url}\n`;

    if (metadata.author) {
        template += ` |author=${metadata.author}\n`;
    }

    if (metadata.publisher) {
        template += ` |website=${metadata.publisher}\n`;
    }

    if (metadata.publishDate) {
        template += ` |date=${metadata.publishDate}\n`;
    }

    template += ` |access-date=${metadata.accessDate}\n`;

    if (metadata.language && metadata.language !== 'en') {
        template += ` |language=${metadata.language}\n`;
    }

    template += "}}";

    return template;
}

/**
 * Formats a date string for Wikipedia citations
 * @param {string} dateString - Input date string
 * @returns {string} - Formatted date (YYYY-MM-DD)
 */
function formatDateForWikipedia(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
}

/**
 * Validates and sanitizes author names
 * @param {string} author - Author name to clean
 * @returns {string} - Cleaned author name
 */
function cleanAuthorName(author) {
    if (!author) return '';

    return author
        .trim()
        .replace(/^(By|Written by|Author:)\s+/i, '') // Remove common prefixes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/,$/, ''); // Remove trailing comma
}

/**
 * Legacy function for backwards compatibility
 * @param {Object} tab - Browser tab object
 * @deprecated Use generateWikipediaTemplate instead
 */
function generateReferenceTemplateString(tab) {
    console.warn('generateReferenceTemplateString is deprecated. Use generateWikipediaTemplate instead.');
    if (!tab) return '';

    // Basic template with just URL and access date
    const accessDate = new Date().toISOString().split('T')[0];
    return `{{cite web\n |url=${tab.url}\n |title=${tab.title || ''}\n |access-date=${accessDate}\n}}`;
}

/**
 * Legacy function for backwards compatibility
 * @param {Object} tab - Browser tab object
 * @deprecated Use modern popup interface instead
 */
function showReferenceTemplateUser(tab) {
    console.warn('showReferenceTemplateUser is deprecated. Use modern popup interface instead.');
    const templateString = generateReferenceTemplateString(tab);
    console.log('Generated template:', templateString);
}
