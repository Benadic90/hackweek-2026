// DOM Elements
const imageUpload = document.getElementById('image-upload');
const emptyState = document.getElementById('empty-state');
const comparisonView = document.getElementById('comparison-view');
const originalImg = document.getElementById('original-img');
const simulatedImg = document.getElementById('simulated-img');
const modeButtons = document.querySelectorAll('.mode-btn');
const simulationTitle = document.getElementById('simulation-title');

// Handle Image Upload using FileReader API
imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Set image source for both original and simulated views
      originalImg.src = e.target.result;
      simulatedImg.src = e.target.result;
      
      // Hide empty state and show comparison view
      emptyState.style.display = 'none';
      comparisonView.classList.remove('hidden');
    };
    
    reader.readAsDataURL(file);
  }
});

// Handle Filter Switching
modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    modeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Get filter type from data attribute
    const filterType = button.getAttribute('data-filter');
    
    // Update the title
    simulationTitle.textContent = button.textContent;
    
    // Reset all filter classes
    simulatedImg.className = '';
    
    // Apply new filter if not normal
    if (filterType !== 'normal') {
      simulatedImg.classList.add(`filter-${filterType}`);
    }
  });
});
