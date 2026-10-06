document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('download-form');
const urlInput = document.getElementById('tweet-url');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');
const resultSection = document.getElementById('result-section');
const resultCard = document.getElementById('result-card');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);
  hideResult();
  showStatus('Fetching video…', 'loading');

  try {
    const res = await fetch('/api/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showStatus(data.message || 'Something went wrong. Please try again.', 'error');
      return;
    }

    hideStatus();
    renderResult(data);
  } catch (err) {
    showStatus('Network error — please try again.', 'error');
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Fetching…' : 'Download';
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.hidden = false;
}

function hideStatus() {
  statusMessage.hidden = true;
}

function hideResult() {
  resultSection.hidden = true;
  resultCard.innerHTML = '';
}

function renderResult(data) {
  const { author, text, thumbnail, videos } = data;

  const qualityItems = videos
    .map(
      (v) => `
      <div class="quality-item">
        <span class="label">${v.quality}</span>
        <a href="${v.url}" target="_blank" rel="noopener noreferrer" download>Download</a>
      </div>`
    )
    .join('');

  resultCard.innerHTML = `
    <div class="result-thumb">
      <video controls poster="${thumbnail || ''}" src="${videos[0]?.url || ''}"></video>
    </div>
    <div class="result-info">
      <div class="result-author">
        ${author.avatar ? `<img src="${author.avatar}" alt="${author.name}" />` : ''}
        <div>
          <div class="name">${escapeHtml(author.name)}</div>
          <div class="handle">@${escapeHtml(author.handle)}</div>
        </div>
      </div>
      ${text ? `<p class="result-text">${escapeHtml(text)}</p>` : ''}
      <div class="quality-list">
        ${qualityItems}
      </div>
    </div>
  `;

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
