# File Metadata Inspector

Hi Reviewer! 👋

This is my submission for the **File Metadata Inspector** challenge (200 Points, Frontend).

I built a clean, professional file analysis tool that extracts and displays comprehensive metadata from uploaded Images and PDFs, entirely in the browser with zero backend dependency.

---

## 🛠️ Tech Stack
**HTML5, CSS3, Vanilla JavaScript, EXIF.js, PDF.js**

---

## ✨ Features

### Image Support (JPG, PNG, WebP)
| Feature | How It Works |
|---|---|
| File Name, Size, MIME Type | Browser `File` API |
| Last Modified Date | Browser `File` API |
| Width, Height, Aspect Ratio | `Image()` object + `naturalWidth` / `naturalHeight` |
| Camera Make & Model | `EXIF.js` library |
| Date Taken, Exposure, ISO, F-Number | `EXIF.js` library |
| GPS Coordinates | `EXIF.js` + DMS to Decimal conversion |

### PDF Support
| Feature | How It Works |
|---|---|
| File Name, Size, MIME Type | Browser `File` API |
| Page Count | `PDF.js` library |
| Title, Author, Subject | `PDF.js` metadata API |
| Creator, Producer | `PDF.js` metadata API |
| Creation Date, Modification Date | `PDF.js` metadata API |

---

## 🚀 How to Run Locally
This is a purely client-side application. No `npm install` or server setup is needed.

1. Clone this repository.
2. Navigate to the `file-metadata-inspector` folder.
3. Open `index.html` in any modern browser (Chrome recommended).
4. Upload an image (try a JPEG from a camera for full EXIF data) or a PDF.

---

## 📸 Demo Screenshots
*(Screenshots are available in the submission form)*

---

## 🏗️ Architecture
```
file-metadata-inspector/
├── index.html    ← Page structure + SVG icons
├── style.css     ← Clean, professional UI styling
├── script.js     ← All file processing logic
└── README.md     ← This file
```

The entire application runs client-side. When a user uploads a file:
1. The **Browser File API** extracts basic info (name, size, type, last modified).
2. For **images**, a hidden `Image()` object reads the natural dimensions, and **EXIF.js** parses the binary EXIF header for camera metadata.
3. For **PDFs**, **PDF.js** parses the document structure to extract page count and internal metadata fields.

No data ever leaves the user's browser — everything is processed locally.

Thanks for reviewing! 🙏
