# Digital Time Capsule

Hi Reviewer! 👋

This is my submission for the **Digital Time Capsule** challenge (200 Points, Fullstack).

I built a full-featured time capsule application where users can store digital memories — messages and images — that stay **sealed and locked** until a chosen future date, at which point they automatically unlock and reveal their content.

---

## 🛠️ Tech Stack
**HTML5, CSS3, Vanilla JavaScript, Node.js, Express, Multer, UUID**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Create Capsules** | Users can write a title, message, set an unlock date, and optionally attach an image. |
| **Scheduled Unlock** | Capsules are locked until the chosen date. The server hides the message and image from the API response until the time arrives. |
| **Live Countdown Timer** | Each locked capsule shows a real-time countdown (days, hours, minutes, seconds) ticking down to its unlock moment. |
| **Auto Unlock** | When the countdown reaches zero, the page automatically refreshes the capsule to reveal its content. |
| **Media Uploads** | Images are uploaded via `Multer` and stored on the server, then displayed inside the capsule once unlocked. |
| **Public / Private** | Users can mark capsules as public or private. |
| **Delete Capsules** | Users can permanently delete any capsule. |
| **XSS Protection** | All user input is HTML-escaped before rendering to prevent script injection. |

---

## 🚀 How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Benadic90/hackweek-2026.git

# 2. Navigate to the project
cd hackweek-2026/digital-time-capsule

# 3. Install dependencies
npm install

# 4. Start the server
npm start

# 5. Open in browser
# Visit http://localhost:3000
```

---

## 🏗️ Architecture

```
digital-time-capsule/
├── server.js          ← Express + Multer + JSON storage
├── package.json       ← Dependencies
├── .gitignore
├── data/
│   └── capsules.json  ← Auto-created JSON database
├── uploads/           ← Auto-created image storage
├── public/
│   ├── index.html     ← UI structure + modal form
│   ├── style.css      ← Professional styling
│   └── script.js      ← Client-side CRUD + countdown logic
└── README.md          ← You're reading this!
```

### How the Lock/Unlock Works
The server is the single source of truth. When a client requests `/api/capsules`, the server checks each capsule's `unlockDate` against the current time. If the capsule hasn't reached its unlock date yet, the server **strips the message and image** from the response, ensuring the content truly cannot be accessed early — even if someone inspects the network requests.

Thanks for reviewing! 🙏
