let allData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="4" class="empty-state">Cannot read storage on this page.</td></tr>';
    return;
  }

  const url = new URL(tab.url);

  // Fetch Cookies
  const cookies = await chrome.cookies.getAll({ domain: url.hostname });
  const cookieData = cookies.map(c => ({
    type: 'Cookie',
    key: c.name,
    value: c.value,
    size: c.name.length + c.value.length
  }));

  // Fetch Local & Session Storage via injected script
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const getStorage = (storageObj) => {
        const items = [];
        for (let i = 0; i < storageObj.length; i++) {
          const key = storageObj.key(i);
          const value = storageObj.getItem(key);
          items.push({ key, value, size: key.length + value.length });
        }
        return items;
      };
      return {
        local: getStorage(localStorage),
        session: getStorage(sessionStorage)
      };
    }
  });

  const pageStorage = results[0].result;
  
  const localData = pageStorage.local.map(item => ({
    type: 'Local Storage',
    ...item
  }));
  
  const sessionData = pageStorage.session.map(item => ({
    type: 'Session Storage',
    ...item
  }));

  allData = [...localData, ...sessionData, ...cookieData];
  renderTable(allData);

  // Event Listeners for Filters & Search
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('filter-local').addEventListener('change', applyFilters);
  document.getElementById('filter-session').addEventListener('change', applyFilters);
  document.getElementById('filter-cookies').addEventListener('change', applyFilters);
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getTypeClass(type) {
  if (type === 'Local Storage') return 'type-local';
  if (type === 'Session Storage') return 'type-session';
  return 'type-cookie';
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const showLocal = document.getElementById('filter-local').checked;
  const showSession = document.getElementById('filter-session').checked;
  const showCookies = document.getElementById('filter-cookies').checked;

  const filteredData = allData.filter(item => {
    // Type Filter
    if (item.type === 'Local Storage' && !showLocal) return false;
    if (item.type === 'Session Storage' && !showSession) return false;
    if (item.type === 'Cookie' && !showCookies) return false;

    // Search Filter
    if (searchTerm) {
      return item.key.toLowerCase().includes(searchTerm) || 
             item.value.toLowerCase().includes(searchTerm) ||
             item.type.toLowerCase().includes(searchTerm);
    }
    return true;
  });

  renderTable(filteredData);
}

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No storage items found matching your filters.</td></tr>';
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    
    // Truncate very long values for display
    const displayValue = item.value.length > 100 ? item.value.substring(0, 100) + '...' : item.value;

    tr.innerHTML = `
      <td><span class="type-badge ${getTypeClass(item.type)}">${item.type}</span></td>
      <td><strong>${item.key}</strong></td>
      <td title="${item.value}">${displayValue}</td>
      <td>${formatBytes(item.size)}</td>
    `;
    tbody.appendChild(tr);
  });
}
