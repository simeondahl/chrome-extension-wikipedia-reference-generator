# Wikipedia Citation Generator Chrome Extension

A Chrome extension that automatically generates Wikipedia citation templates from any website you visit.

## Features

- **Automatic Metadata Extraction**: Extracts title, author, publisher, publication date, and other metadata from web pages
- **Smart Template Selection**: Automatically chooses between `{{cite web}}` and `{{cite news}}` templates based on content type
- **Manifest V3 Compatible**: Uses the latest Chrome extension standards
- **Context Menu Integration**: Right-click on any page to generate a citation
- **Popup Interface**: Click the extension icon for an easy-to-use interface
- **Customizable Options**: Configure citation preferences in the options page
- **Copy to Clipboard**: One-click copying of generated citations

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the extension folder
4. The extension icon should appear in your toolbar

## Usage

### Method 1: Extension Popup
1. Navigate to any webpage you want to cite
2. Click the Wikipedia Citation Generator icon in your toolbar
3. Click "Generate Citation Template"
4. Copy the generated template to your clipboard

### Method 2: Context Menu
1. Navigate to any webpage you want to cite
2. Right-click anywhere on the page
3. Select "Generate Wikipedia Citation"
4. Click the extension icon to view and copy the generated template

## Generated Template Format

The extension generates properly formatted Wikipedia citation templates:

### For Web Pages:
```
{{cite web
 |title=Page Title
 |url=https://example.com/page
 |author=Author Name
 |website=Website Name
 |date=2025-01-01
 |access-date=2025-10-02
}}
```

### For News Articles:
```
{{cite news
 |title=Article Title
 |url=https://news.example.com/article
 |author=Reporter Name
 |newspaper=News Site
 |date=2025-01-01
 |access-date=2025-10-02
}}
```

## Configuration

Access the options page by:
1. Right-clicking the extension icon and selecting "Options"
2. Or navigating to `chrome://extensions/` and clicking "Details" → "Extension options"

Available options:
- **Include access date**: Always include the date you accessed the page
- **Auto-detect news articles**: Automatically use cite news template for news sites
- **Include language parameter**: Add language parameter for non-English content
- **Default author**: Fallback author name when none is detected
- **Multi-line format**: Format templates with each parameter on a new line

## Supported Metadata

The extension attempts to extract the following information:
- **Title**: Page title (cleaned of site name)
- **Author**: Article author or byline
- **Publisher/Website**: Site name or publisher
- **Publication Date**: When the content was published
- **Language**: Content language (if not English)
- **URL**: Current page URL
- **Access Date**: Date you accessed the page

## Browser Compatibility

- Chrome (Manifest V3)
- Other Chromium-based browsers (Edge, Brave, etc.)

## Privacy

This extension:
- Only accesses the currently active tab when you trigger citation generation
- Does not collect or transmit any personal data
- Stores preferences locally in your browser
- Does not require any external network connections

## Troubleshooting

**No metadata extracted**: Some websites may not have standard metadata tags. The extension will still generate a basic citation with the URL and title.

**Missing author/date**: Not all websites include author or publication date information in their metadata.

**Incorrect publisher name**: The extension tries multiple methods to detect the publisher name, but may sometimes use the domain name as a fallback.

## Version History

### v2.0 (Current)
- Updated to Manifest V3
- Complete rewrite with modern APIs
- Enhanced metadata extraction
- Improved user interface
- Added customizable options
- Smart template type detection

### v1.0 (Legacy)
- Basic Manifest V2 implementation
- Limited functionality

## License

This extension is provided as-is for educational and personal use.