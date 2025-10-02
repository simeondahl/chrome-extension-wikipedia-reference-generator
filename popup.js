// Wikipedia Reference Generator - Popup Script

document.addEventListener('DOMContentLoaded', function () {
  const generateBtn = document.getElementById('generateBtn');
  const loadingDiv = document.getElementById('loadingDiv');
  const templateContainer = document.getElementById('templateContainer');
  const templateOutput = document.getElementById('templateOutput');
  const copyBtn = document.getElementById('copyBtn');
  const metadataContainer = document.getElementById('metadataContainer');
  const metadataContent = document.getElementById('metadataContent');
  const errorDiv = document.getElementById('errorDiv');

  // Check if there's a previously generated template
  loadPreviousTemplate();

  generateBtn.addEventListener('click', generateReference);
  copyBtn.addEventListener('click', copyToClipboard);

  // Listen for template generation messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'templateGenerated') {
      displayTemplate(message.template, message.metadata);
    }
  });

  async function generateReference() {
    try {
      hideError();
      showLoading();
      hideTemplate();

      // Send message to background script to generate reference
      chrome.runtime.sendMessage({ action: 'generateReference' });

      // Wait a bit for the background script to process
      setTimeout(async () => {
        const result = await chrome.storage.local.get(['lastTemplate', 'lastMetadata']);
        if (result.lastTemplate) {
          displayTemplate(result.lastTemplate, result.lastMetadata);
        } else {
          showError('Could not extract metadata from this page. Please try again.');
        }
        hideLoading();
      }, 1000);

    } catch (error) {
      console.error('Error generating reference:', error);
      showError('An error occurred while generating the citation. Please try again.');
      hideLoading();
    }
  }

  async function loadPreviousTemplate() {
    try {
      const result = await chrome.storage.local.get(['lastTemplate', 'lastMetadata']);
      if (result.lastTemplate) {
        displayTemplate(result.lastTemplate, result.lastMetadata);
      }
    } catch (error) {
      console.error('Error loading previous template:', error);
    }
  }

  function displayTemplate(template, metadata) {
    templateOutput.textContent = template;
    templateContainer.style.display = 'block';

    if (metadata) {
      displayMetadata(metadata);
    }
  }

  function displayMetadata(metadata) {
    let metadataHtml = '';

    if (metadata.title) {
      metadataHtml += `<div class="metadata-item"><span class="metadata-label">Title:</span> ${escapeHtml(metadata.title)}</div>`;
    }

    if (metadata.author) {
      metadataHtml += `<div class="metadata-item"><span class="metadata-label">Author:</span> ${escapeHtml(metadata.author)}</div>`;
    }

    if (metadata.publisher) {
      metadataHtml += `<div class="metadata-item"><span class="metadata-label">Publisher:</span> ${escapeHtml(metadata.publisher)}</div>`;
    }

    if (metadata.publishDate) {
      metadataHtml += `<div class="metadata-item"><span class="metadata-label">Publish Date:</span> ${metadata.publishDate}</div>`;
    }

    metadataHtml += `<div class="metadata-item"><span class="metadata-label">Access Date:</span> ${metadata.accessDate}</div>`;
    metadataHtml += `<div class="metadata-item"><span class="metadata-label">URL:</span> ${escapeHtml(metadata.url)}</div>`;

    metadataContent.innerHTML = metadataHtml;
    metadataContainer.style.display = 'block';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(templateOutput.textContent);

      // Show success feedback
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copy-success');

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copy-success');
      }, 2000);

    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showError('Failed to copy to clipboard. Please select and copy manually.');
    }
  }

  function showLoading() {
    loadingDiv.style.display = 'block';
    generateBtn.disabled = true;
  }

  function hideLoading() {
    loadingDiv.style.display = 'none';
    generateBtn.disabled = false;
  }

  function hideTemplate() {
    templateContainer.style.display = 'none';
    metadataContainer.style.display = 'none';
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  function hideError() {
    errorDiv.style.display = 'none';
  }
});
