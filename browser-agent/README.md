# Autonomous Browser Agent

Hi Reviewer! 👋

This is my submission for the **Autonomous Browser Agent** challenge (500 Points, Advanced, Backend).

I built a web-based browser automation agent that can **autonomously navigate real websites, interact with DOM elements, extract structured data, and complete real-world tasks** — all with a sleek, dark-themed control panel that streams step-by-step activity logs in real time.

---

## 🛠️ Tech Stack
**Node.js, Express, Puppeteer (Headless Chrome), Server-Sent Events (SSE), HTML5, CSS3, Vanilla JavaScript**

---

## 🤖 Agent Skills (5 Tasks)

| # | Skill | What the Agent Does |
|---|-------|-------------------|
| 1 | **Google Search** | Opens Google → Types search query → Submits form → Extracts top 5 results (title, URL, snippet) |
| 2 | **Full-Page Screenshot** | Opens any URL → Waits for full render → Captures a full-page screenshot |
| 3 | **Page Data Extractor** | Opens any URL → Traverses the entire DOM → Extracts all headings, links, images, and metadata into a structured report |
| 4 | **Auto Form Filler** | Opens a real test form (httpbin.org) → Fills text inputs, radio buttons, checkboxes, textarea → Submits → Captures before/after screenshots |
| 5 | **Wikipedia Lookup** | Opens Wikipedia → Searches for topic → Navigates to article → Extracts summary paragraphs and table of contents |

---

## ✨ Key Technical Features

### Server-Sent Events (SSE) for Real-Time Logs
Instead of the user clicking "Run" and waiting for a response, I implemented **Server-Sent Events**. This opens a persistent one-way connection from the server to the browser, allowing the agent to stream step-by-step log messages in real time as Puppeteer performs each action.

### Modular Task Architecture
Each task is a standalone Node.js module in the `/tasks` directory. The server routes the user's request to the correct module. This design makes it trivial to add new tasks without modifying the core server logic.

### Screenshot Proof
Every task captures at least one screenshot of the browser during execution. These screenshots are saved to the `/screenshots` folder and displayed directly in the UI as visual proof of the agent's actions.

---

## 🚀 How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Benadic90/hackweek-2026.git

# 2. Navigate to the project
cd hackweek-2026/browser-agent

# 3. Install dependencies (this will download Puppeteer + Chromium)
npm install

# 4. Start the server
npm start

# 5. Open in browser
# Visit http://localhost:3000
```

> **Note:** `npm install` will automatically download a bundled Chromium browser (~150MB). This is required for Puppeteer to function.

---

## 🏗️ Architecture

```
browser-agent/
├── server.js              ← Express + SSE streaming + task routing
├── package.json
├── .gitignore
├── tasks/
│   ├── searchGoogle.js    ← Google search skill
│   ├── screenshotPage.js  ← Screenshot skill
│   ├── extractData.js     ← Data extraction skill
│   ├── fillForm.js        ← Form filling skill
│   └── wikiLookup.js      ← Wikipedia lookup skill
├── screenshots/           ← Auto-created screenshot storage
├── public/
│   ├── index.html         ← Dark-themed control panel
│   ├── style.css          ← Terminal-inspired UI styling
│   └── script.js          ← SSE client + result rendering
└── README.md
```

---

## 📸 Demo Video
*(Check the main submission form for the screen recording link)*

The demo video shows the agent successfully completing all 5 tasks autonomously with real-time logs streaming in the control panel.

Thanks for reviewing! 🙏
