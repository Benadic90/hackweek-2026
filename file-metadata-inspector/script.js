// DOM references
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const resultsDiv = document.getElementById('results');
const previewImg = document.getElementById('preview-img');
const pdfPreview = document.getElementById('pdf-preview');
const basicTable = document.querySelector('#basic-table tbody');
const dimensionsCard = document.getElementById('dimensions-card');
const dimensionsTable = document.querySelector('#dimensions-table tbody');
const exifCard = document.getElementById('exif-card');
const exifTable = document.querySelector('#exif-table tbody');
const pdfCard = document.getElementById('pdf-card');
const pdfTable = document.querySelector('#pdf-table tbody');

// set the pdf.js worker path so it doesn't complain
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Click on the upload zone to trigger file input
uploadZone.addEventListener('click', () => fileInput.click());

// Drag and drop handlers
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Regular file input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Main handler — decides what to do based on file type
function handleFile(file) {
  // clear previous results first
  resetUI();

  // show the basic info that applies to any file
  showBasicInfo(file);

  // figure out what kind of file we got
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  if (isImage) {
    handleImage(file);
  } else if (isPdf) {
    handlePdf(file);
  }

  // reveal the results panel
  resultsDiv.classList.remove('hidden');
}

// Show basic file info using the Browser File API
function showBasicInfo(file) {
  const rows = [
    ['File Name', file.name],
    ['MIME Type', file.type || 'Unknown'],
    ['File Size', formatSize(file.size)],
    ['Last Modified', file.lastModifiedDate ? file.lastModifiedDate.toLocaleString() : new Date(file.lastModified).toLocaleString()]
  ];

  rows.forEach(([label, value]) => addRow(basicTable, label, value));
}

// Handle image files — preview, dimensions, EXIF
function handleImage(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    // show image preview
    previewImg.src = e.target.result;
    previewImg.classList.remove('hidden');

    // we need to load the image to get its natural dimensions
    const img = new Image();
    img.onload = () => {
      dimensionsCard.classList.remove('hidden');
      addRow(dimensionsTable, 'Width', img.naturalWidth + ' px');
      addRow(dimensionsTable, 'Height', img.naturalHeight + ' px');
      addRow(dimensionsTable, 'Aspect Ratio', (img.naturalWidth / img.naturalHeight).toFixed(2));
    };
    img.src = e.target.result;

    // try to extract EXIF data (only works with JPEG usually)
    extractExif(file);
  };

  reader.readAsDataURL(file);
}

// Extract EXIF data using the EXIF.js library
function extractExif(file) {
  EXIF.getData(file, function() {
    const make = EXIF.getTag(this, 'Make');
    const model = EXIF.getTag(this, 'Model');
    const dateTaken = EXIF.getTag(this, 'DateTimeOriginal');
    const exposure = EXIF.getTag(this, 'ExposureTime');
    const fNumber = EXIF.getTag(this, 'FNumber');
    const iso = EXIF.getTag(this, 'ISOSpeedRatings');
    const focalLength = EXIF.getTag(this, 'FocalLength');
    const flash = EXIF.getTag(this, 'Flash');
    const gpsLat = EXIF.getTag(this, 'GPSLatitude');
    const gpsLon = EXIF.getTag(this, 'GPSLongitude');
    const gpsLatRef = EXIF.getTag(this, 'GPSLatitudeRef');
    const gpsLonRef = EXIF.getTag(this, 'GPSLongitudeRef');

    // check if we actually got any exif data at all
    const hasData = make || model || dateTaken || exposure || iso;

    if (hasData) {
      exifCard.classList.remove('hidden');

      if (make) addRow(exifTable, 'Camera Make', make);
      if (model) addRow(exifTable, 'Camera Model', model);
      if (dateTaken) addRow(exifTable, 'Date Taken', dateTaken);
      if (exposure) addRow(exifTable, 'Exposure Time', exposure.numerator + '/' + exposure.denominator + ' sec');
      if (fNumber) addRow(exifTable, 'F-Number', 'f/' + fNumber);
      if (iso) addRow(exifTable, 'ISO', iso);
      if (focalLength) addRow(exifTable, 'Focal Length', focalLength + ' mm');
      if (flash !== undefined) addRow(exifTable, 'Flash', flash ? 'Yes' : 'No');

      // format GPS coordinates if available
      if (gpsLat && gpsLon) {
        const lat = convertDMStoDD(gpsLat, gpsLatRef);
        const lon = convertDMStoDD(gpsLon, gpsLonRef);
        addRow(exifTable, 'GPS Latitude', lat.toFixed(6) + '° ' + gpsLatRef);
        addRow(exifTable, 'GPS Longitude', lon.toFixed(6) + '° ' + gpsLonRef);
      }
    }
  });
}

// Handle PDF files — preview icon + pdf.js metadata
function handlePdf(file) {
  // show pdf icon instead of image preview
  pdfPreview.classList.remove('hidden');

  const reader = new FileReader();

  reader.onload = (e) => {
    const typedArray = new Uint8Array(e.target.result);

    // use pdf.js to open the document and read its metadata
    pdfjsLib.getDocument(typedArray).promise.then((pdf) => {
      pdfCard.classList.remove('hidden');
      addRow(pdfTable, 'Page Count', pdf.numPages);

      // get the internal metadata
      pdf.getMetadata().then((meta) => {
        const info = meta.info;
        if (info.Title) addRow(pdfTable, 'Title', info.Title);
        if (info.Author) addRow(pdfTable, 'Author', info.Author);
        if (info.Subject) addRow(pdfTable, 'Subject', info.Subject);
        if (info.Creator) addRow(pdfTable, 'Creator', info.Creator);
        if (info.Producer) addRow(pdfTable, 'Producer', info.Producer);
        if (info.CreationDate) addRow(pdfTable, 'Creation Date', formatPdfDate(info.CreationDate));
        if (info.ModDate) addRow(pdfTable, 'Modification Date', formatPdfDate(info.ModDate));
        if (info.PDFFormatVersion) addRow(pdfTable, 'PDF Version', info.PDFFormatVersion);
      });
    });
  };

  reader.readAsArrayBuffer(file);
}

// --- Helper functions ---

// add a row to a table body
function addRow(tableBody, label, value) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${label}</td><td>${value}</td>`;
  tableBody.appendChild(tr);
}

// format bytes into human readable sizes
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// convert GPS DMS (degrees/minutes/seconds) to decimal degrees
function convertDMStoDD(dms, ref) {
  let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
  if (ref === 'S' || ref === 'W') dd *= -1;
  return dd;
}

// pdf dates come in a weird format like "D:20230101120000"
function formatPdfDate(dateStr) {
  if (!dateStr) return 'N/A';
  // strip the "D:" prefix and try to parse it
  const cleaned = dateStr.replace('D:', '').replace(/'/g, '');
  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);
  const hour = cleaned.substring(8, 10) || '00';
  const minute = cleaned.substring(10, 12) || '00';
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

// clear all previous results so a new file starts fresh
function resetUI() {
  basicTable.innerHTML = '';
  dimensionsTable.innerHTML = '';
  exifTable.innerHTML = '';
  pdfTable.innerHTML = '';
  dimensionsCard.classList.add('hidden');
  exifCard.classList.add('hidden');
  pdfCard.classList.add('hidden');
  previewImg.classList.add('hidden');
  pdfPreview.classList.add('hidden');
  previewImg.src = '';
}
