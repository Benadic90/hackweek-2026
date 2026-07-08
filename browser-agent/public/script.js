// DOM references
const taskSelect = document.getElementById('task-select');
const taskInput = document.getElementById('task-input');
const inputLabel = document.getElementById('input-label');
const inputGroup = document.getElementById('input-group');
const runBtn = document.getElementById('run-btn');
const logArea = document.getElementById('log-area');
const clearBtn = document.getElementById('clear-btn');
const statusText = document.getElementById('status-text');
const taskDescription = document.getElementById('task-description');
const resultsSection = document.getElementById('results-section');
const resultsContent = document.getElementById('results-content');

// Task descriptions and input labels for each task type
const taskConfig = {
  search: {
    label: 'Search Query',
    placeholder: 'e.g. best programming languages 2026',
    description: 'The agent will search the web for your query and extract the top results.',
    needsInput: true
  },
  screenshot: {
    label: 'URL to Capture',
    placeholder: 'e.g. https://github.com',
    description: 'The agent will navigate to the URL and capture a full-page screenshot.',
    needsInput: true
  },
  extract: {
    label: 'URL to Analyze',
    placeholder: 'e.g. https://news.ycombinator.com',
    description: 'The agent will extract all headings, links, and images from the page.',
    needsInput: true
  },
  form: {
    label: '',
    placeholder: '',
    description: 'The agent will navigate to a test form, fill every field with realistic data, and submit it.',
    needsInput: false
  },
  wiki: {
    label: 'Topic',
    placeholder: 'e.g. Artificial Intelligence',
    description: 'The agent will search Wikipedia for your topic and extract the article summary.',
    needsInput: true
  }
};

// Update the form when the user picks a different task
taskSelect.addEventListener('change', () => {
  const config = taskConfig[taskSelect.value];
  
  if (config.needsInput) {
    inputGroup.style.display = 'flex';
    inputLabel.textContent = config.label;
    taskInput.placeholder = config.placeholder;
    taskInput.value = '';
  } else {
    inputGroup.style.display = 'none';
  }
  
  taskDescription.textContent = config.description;
});

// Clear the log area
clearBtn.addEventListener('click', () => {
  logArea.innerHTML = '<p class="log-line system">Log cleared.</p>';
  resultsSection.classList.add('hidden');
});

// Run the agent
runBtn.addEventListener('click', () => {
  const task = taskSelect.value;
  const input = taskInput.value.trim();
  const config = taskConfig[task];

  // Validate input
  if (config.needsInput && !input) {
    addLog('Please provide an input before running the agent.', 'error');
    return;
  }

  // Disable the button while the agent is working
  runBtn.disabled = true;
  statusText.textContent = 'Agent Running...';
  statusText.className = 'status-text running';
  resultsSection.classList.add('hidden');

  addLog(`Task "${task}" started.`, 'system');

  // Connect to the server using Server-Sent Events (SSE)
  // This lets us receive real-time log messages as they happen
  const params = new URLSearchParams({ task, input });
  const eventSource = new EventSource(`/api/run?${params}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'log') {
      // It's a real-time log message — display it in the terminal
      addLog(data.message, 'agent');
    }

    if (data.type === 'result') {
      // The task is done — render the results
      addLog('Task completed successfully!', 'system');
      renderResults(data.data);
      finish();
      eventSource.close();
    }

    if (data.type === 'error') {
      addLog(`Error: ${data.message}`, 'error');
      finish();
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    addLog('Connection to agent lost.', 'error');
    finish();
    eventSource.close();
  };
});

// Add a log line to the terminal
function addLog(message, type) {
  const p = document.createElement('p');
  p.className = `log-line ${type}`;
  
  // Add a timestamp
  const time = new Date().toLocaleTimeString();
  p.textContent = `[${time}] ${message}`;
  
  logArea.appendChild(p);
  // Auto-scroll to the bottom
  logArea.scrollTop = logArea.scrollHeight;
}

// Re-enable the run button
function finish() {
  runBtn.disabled = false;
  statusText.textContent = 'Ready';
  statusText.className = 'status-text';
}

// Render results based on the task type
function renderResults(data) {
  resultsSection.classList.remove('hidden');
  resultsContent.innerHTML = '';

  if (data.type === 'search') {
    // Show search results as cards
    data.results.forEach((item, i) => {
      resultsContent.innerHTML += `
        <div class="result-item">
          <h4>${i + 1}. ${item.title}</h4>
          <a href="${item.url}" target="_blank">${item.url}</a>
          <p>${item.snippet}</p>
        </div>
      `;
    });
    if (data.screenshot) {
      resultsContent.innerHTML += `<img src="${data.screenshot}" class="result-screenshot" alt="Screenshot">`;
    }
  }

  else if (data.type === 'screenshot') {
    resultsContent.innerHTML = `
      <div class="result-item">
        <h4>${data.pageTitle}</h4>
        <a href="${data.url}" target="_blank">${data.url}</a>
      </div>
      <img src="${data.screenshot}" class="result-screenshot" alt="Full page screenshot">
    `;
  }

  else if (data.type === 'extract') {
    let html = `<div class="result-item"><h4>Page: ${data.data.title}</h4>
      <p>Meta Description: ${data.data.metaDescription}</p>
      <table class="result-table">
        <tr><td>Headings Found</td><td>${data.data.headingCount}</td></tr>
        <tr><td>Links Found</td><td>${data.data.linkCount}</td></tr>
        <tr><td>Images Found</td><td>${data.data.imageCount}</td></tr>
      </table></div>`;

    // Show extracted headings
    html += '<div class="result-item"><h4>Headings</h4>';
    data.data.headings.forEach(h => {
      html += `<p><strong>${h.tag}:</strong> ${h.text}</p>`;
    });
    html += '</div>';

    if (data.screenshot) {
      html += `<img src="${data.screenshot}" class="result-screenshot" alt="Screenshot">`;
    }
    resultsContent.innerHTML = html;
  }

  else if (data.type === 'form') {
    let html = '<div class="result-item"><h4>Form Fields Filled</h4><table class="result-table">';
    data.filledFields.forEach(f => {
      html += `<tr><td>${f.field}</td><td>${f.value}</td></tr>`;
    });
    html += '</table></div>';
    
    if (data.screenshotBefore) {
      html += '<div class="result-item"><h4>Filled Form (Before Submit)</h4>';
      html += `<img src="${data.screenshotBefore}" class="result-screenshot" alt="Before submit"></div>`;
    }
    if (data.screenshotAfter) {
      html += '<div class="result-item"><h4>Submission Response</h4>';
      html += `<img src="${data.screenshotAfter}" class="result-screenshot" alt="After submit"></div>`;
    }
    resultsContent.innerHTML = html;
  }

  else if (data.type === 'wiki') {
    let html = `<div class="result-item">
      <h4>${data.article.title}</h4>
      <a href="${data.article.url}" target="_blank">${data.article.url}</a>
      <p style="margin-top:1rem;color:#e2e8f0;line-height:1.7">${data.article.summary}</p>
    </div>`;

    if (data.article.sections.length > 0) {
      html += '<div class="result-item"><h4>Table of Contents</h4>';
      data.article.sections.forEach(s => {
        html += `<p>• ${s}</p>`;
      });
      html += '</div>';
    }

    if (data.screenshot) {
      html += `<img src="${data.screenshot}" class="result-screenshot" alt="Wikipedia article">`;
    }
    resultsContent.innerHTML = html;
  }
}
