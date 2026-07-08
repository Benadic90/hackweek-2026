# Color Blindness Simulator

Hi Reviewer! 👋

This is my submission for the Frontend **Color Blindness Simulator** challenge (200 points). I focused heavily on providing a clean, professional, and accessible UI, similar to high-end design tools. 

Instead of a flashy aesthetic, this tool is designed for strict utility and user experience. 

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, SVG Filters

### ✨ Technical Implementation Details
- **No Backend Required:** I utilized the browser's native `FileReader` API. When a user uploads an image, it reads the file locally into a Base64 data URL and renders it instantly in the browser. 
- **Mathematical SVG Filters:** Rather than relying on external libraries or heavy canvas pixel manipulation, I used mathematically accurate **SVG Color Matrices** (`<feColorMatrix>`). These are injected into the HTML and applied directly via CSS `filter` properties, which is highly performant because it leverages hardware acceleration.
- **Side-by-Side Comparison:** The UI implements a CSS Grid layout allowing users to instantly compare the original image against the filtered version.

### Supported Simulations:
1. Normal Vision
2. Protanopia (Red-Blind)
3. Deuteranopia (Green-Blind)
4. Tritanopia (Blue-Blind)
5. Achromatopsia (Monochromacy)

### 🚀 How to Run Locally
Since it uses pure HTML/CSS/JS with no backend dependencies, you can simply:
1. Clone this repository.
2. Double click the `index.html` file to open it in any modern browser.

### 🎥 Demo Video
[Link to demo video] *(Check the main submission form for the actual video link)*

Thanks for reviewing!
