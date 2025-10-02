// Wikipedia Citation Generator - Options Script

document.addEventListener('DOMContentLoaded', function () {
  // Load saved options
  loadOptions();

  // Save button event listener
  document.getElementById('saveBtn').addEventListener('click', saveOptions);
});

function loadOptions() {
  // Set default values
  const defaults = {
    includeAccessDate: true,
    autoDetectNews: true,
    includeLanguage: true,
    defaultAuthor: '',
    multilineFormat: true
  };

  chrome.storage.sync.get(defaults, function (items) {
    document.getElementById('includeAccessDate').checked = items.includeAccessDate;
    document.getElementById('autoDetectNews').checked = items.autoDetectNews;
    document.getElementById('includeLanguage').checked = items.includeLanguage;
    document.getElementById('defaultAuthor').value = items.defaultAuthor;
    document.getElementById('multilineFormat').checked = items.multilineFormat;
  });
}

function saveOptions() {
  const options = {
    includeAccessDate: document.getElementById('includeAccessDate').checked,
    autoDetectNews: document.getElementById('autoDetectNews').checked,
    includeLanguage: document.getElementById('includeLanguage').checked,
    defaultAuthor: document.getElementById('defaultAuthor').value.trim(),
    multilineFormat: document.getElementById('multilineFormat').checked
  };

  chrome.storage.sync.set(options, function () {
    // Show save confirmation
    const statusDiv = document.getElementById('statusDiv');
    statusDiv.style.display = 'block';
    statusDiv.classList.add('success');

    setTimeout(function () {
      statusDiv.style.display = 'none';
      statusDiv.classList.remove('success');
    }, 3000);
  });
}
