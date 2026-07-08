# Digital Business Card Generator

Hi Reviewer! 👋

This is my submission for the final Day 2 challenge: **Digital Business Card Generator** (100 Points, Frontend).

I built a clean, professional application entirely on the frontend that allows users to input their details, preview a beautifully designed digital business card in real-time, and download it instantly.

---

## 🛠️ Tech Stack
**HTML5, CSS3, Vanilla JavaScript, html2canvas, jsPDF**

---

## ✨ Features

1. **Live Data Binding:** The card preview updates instantly as you type in the input fields. No need to press a "generate" button.
2. **Profile Picture Upload:** Utilizes the browser's native `FileReader` API to read local image files and inject them into the preview instantly without uploading them to a backend server.
3. **Multiple Themes:** Users can select between 3 distinct, professionally designed templates:
   - *Minimal:* Clean, corporate, light mode.
   - *Dark Mode:* Sleek, high-contrast, modern.
   - *Creative:* Uses an elegant serif font (`Playfair Display`) and a softer, styled layout.
4. **Export to PNG/PDF:** 
   - I used `html2canvas` to render the DOM elements of the card directly into an image.
   - I used `jsPDF` to take that rendered image and package it nicely into a downloadable PDF document. 
   - Everything happens purely client-side!

---

## 🚀 How to Run Locally

Since it uses purely client-side technologies, you do not need to install anything.
1. Clone this repository.
2. Navigate to the `digital-business-card` folder.
3. Open `index.html` in any modern browser.

---

## 📸 Demo Screenshots / Video
*(Check the main submission form for the demo link)*

Thanks for reviewing, and happy HackWeek!
