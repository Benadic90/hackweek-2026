// DOM Elements
const inputs = {
  name: document.getElementById('input-name'),
  title: document.getElementById('input-title'),
  email: document.getElementById('input-email'),
  phone: document.getElementById('input-phone'),
  linkedin: document.getElementById('input-linkedin'),
  github: document.getElementById('input-github')
};

const cardElements = {
  name: document.getElementById('card-name'),
  title: document.getElementById('card-title'),
  email: document.getElementById('card-email'),
  phone: document.getElementById('card-phone'),
  linkedin: document.getElementById('card-linkedin'),
  github: document.getElementById('card-github')
};

const imageInput = document.getElementById('input-image');
const cardImage = document.getElementById('card-image');
const businessCard = document.getElementById('business-card');
const templateBtns = document.querySelectorAll('.template-btn');

// 1. Live Data Binding
// Attach an input listener to every form field
Object.keys(inputs).forEach(key => {
  inputs[key].addEventListener('input', (e) => {
    // If input is empty, fallback to a placeholder space to maintain layout
    cardElements[key].textContent = e.target.value || ' ';
  });
});

// 2. Profile Image Upload
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      cardImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// 3. Template Switching
templateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    templateBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Change the class on the actual card element
    const newTheme = btn.getAttribute('data-theme');
    
    // Remove old theme classes
    businessCard.classList.remove('theme-minimal', 'theme-dark', 'theme-creative');
    // Apply new theme class
    businessCard.classList.add(newTheme);
  });
});

// 4. Export to PNG using html2canvas
document.getElementById('btn-download-img').addEventListener('click', () => {
  const captureArea = document.getElementById('card-capture-area');
  
  // html2canvas takes a DOM element and draws it onto a canvas
  html2canvas(captureArea, {
    scale: 2, // Higher resolution
    backgroundColor: null // transparent background
  }).then(canvas => {
    // Convert canvas to data URL
    const image = canvas.toDataURL("image/png");
    
    // Trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = `${inputs.name.value.replace(/\s+/g, '_')}_Business_Card.png`;
    link.click();
  });
});

// 5. Export to PDF using html2canvas + jsPDF
document.getElementById('btn-download-pdf').addEventListener('click', () => {
  const captureArea = document.getElementById('card-capture-area');
  
  html2canvas(captureArea, {
    scale: 2,
    backgroundColor: null
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    
    // Create new PDF (landscape, millimeters, standard business card size ~90x50 plus padding)
    const { jsPDF } = window.jspdf;
    
    // We'll just create a standard A4 landscape for ease, and place the card in the center
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [140, 80] // custom dimensions for the card area
    });
    
    // Add image to PDF (x, y, width, height)
    pdf.addImage(imgData, 'PNG', -5, -5, 150, 90); 
    
    // Save PDF
    pdf.save(`${inputs.name.value.replace(/\s+/g, '_')}_Business_Card.pdf`);
  });
});
