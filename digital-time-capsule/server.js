const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// serve uploaded images from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// make sure our folders exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const capsuleFile = path.join(dataDir, 'capsules.json');

// --- Multer setup for handling image uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // keep a clean filename with a unique prefix
    const ext = path.extname(file.originalname);
    cb(null, uuidv4().slice(0, 8) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// --- Helper to read/write capsules ---
function loadCapsules() {
  if (!fs.existsSync(capsuleFile)) return [];
  const raw = fs.readFileSync(capsuleFile, 'utf-8');
  return JSON.parse(raw);
}

function saveCapsules(capsules) {
  fs.writeFileSync(capsuleFile, JSON.stringify(capsules, null, 2));
}

// --- API Routes ---

// get all capsules
app.get('/api/capsules', (req, res) => {
  const capsules = loadCapsules();
  const now = Date.now();

  // for locked capsules, hide the message and image
  const safe = capsules.map(c => {
    const isUnlocked = now >= new Date(c.unlockDate).getTime();
    return {
      id: c.id,
      title: c.title,
      unlockDate: c.unlockDate,
      createdAt: c.createdAt,
      isPublic: c.isPublic,
      isUnlocked: isUnlocked,
      // only reveal content if unlocked
      message: isUnlocked ? c.message : null,
      image: isUnlocked ? c.image : null
    };
  });

  res.json(safe);
});

// create a new capsule
app.post('/api/capsules', upload.single('image'), (req, res) => {
  const { title, message, unlockDate, isPublic } = req.body;

  // basic validation
  if (!title || !message || !unlockDate) {
    return res.status(400).json({ error: 'Title, message, and unlock date are required.' });
  }

  const capsule = {
    id: uuidv4(),
    title: title,
    message: message,
    unlockDate: unlockDate,
    isPublic: isPublic === 'true',
    image: req.file ? '/uploads/' + req.file.filename : null,
    createdAt: new Date().toISOString()
  };

  const capsules = loadCapsules();
  capsules.push(capsule);
  saveCapsules(capsules);

  res.status(201).json({ success: true, id: capsule.id });
});

// delete a capsule
app.delete('/api/capsules/:id', (req, res) => {
  let capsules = loadCapsules();
  const target = capsules.find(c => c.id === req.params.id);

  if (!target) return res.status(404).json({ error: 'Not found' });

  // also delete the uploaded image if there is one
  if (target.image) {
    const imgPath = path.join(__dirname, target.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  capsules = capsules.filter(c => c.id !== req.params.id);
  saveCapsules(capsules);

  res.json({ success: true });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Time Capsule app running at http://localhost:${PORT}`);
});
