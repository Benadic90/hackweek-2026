// grade points (10-point scale, standard Indian system)
const grades = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
};
const gradeList = Object.keys(grades);

let semesters = [];
let futureList = [];
let semId = 0;
let subjId = 0;
let fSemId = 0;

// switch between calculator and what-if tabs
function switchTab(tab) {
  document.getElementById('btn-calc').classList.toggle('active', tab === 'calc');
  document.getElementById('btn-whatif').classList.toggle('active', tab === 'whatif');
  document.getElementById('tab-calc').classList.toggle('hidden', tab !== 'calc');
  document.getElementById('tab-whatif').classList.toggle('hidden', tab !== 'whatif');

  if (tab === 'whatif') updateWhatIfStats();
}

// helper to escape html in inputs
function esc(s) {
  let d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ---- semester stuff ----

function addSemester() {
  semId++;
  let sem = { id: semId, subjects: [] };
  semesters.push(sem);
  addSubject(sem); // start with one row
  renderSem(sem);
  recalc();
}

function removeSemester(id) {
  semesters = semesters.filter(s => s.id !== id);
  let el = document.getElementById('sem-' + id);
  if (el) el.remove();
  recalc();
}

function addSubject(sem) {
  subjId++;
  sem.subjects.push({ id: subjId, name: '', credits: 3, grade: 'A' });
}

function removeSubject(semIdx, subIdx) {
  let sem = semesters.find(s => s.id === semIdx);
  if (!sem) return;
  sem.subjects = sem.subjects.filter(s => s.id !== subIdx);
  renderSem(sem);
  recalc();
}

function updateSubject(semIdx, subIdx, key, val) {
  let sem = semesters.find(s => s.id === semIdx);
  if (!sem) return;
  let sub = sem.subjects.find(s => s.id === subIdx);
  if (!sub) return;
  sub[key] = val;
  renderSem(sem);
  recalc();
}

function handleAddSubject(semIdx) {
  let sem = semesters.find(s => s.id === semIdx);
  if (!sem) return;
  addSubject(sem);
  renderSem(sem);
}

// render a single semester card
function renderSem(sem) {
  let existing = document.getElementById('sem-' + sem.id);
  let gpa = calcSemGPA(sem);

  let rows = sem.subjects.map(sub => {
    let pts = sub.credits * (grades[sub.grade] || 0);
    let opts = gradeList.map(g =>
      `<option value="${g}" ${g === sub.grade ? 'selected' : ''}>${g} (${grades[g]})</option>`
    ).join('');

    return `<tr class="subj-row">
      <td><input type="text" placeholder="e.g. Data Structures" value="${esc(sub.name)}" onchange="updateSubject(${sem.id},${sub.id},'name',this.value)" /></td>
      <td><input type="number" min="1" max="10" value="${sub.credits}" onchange="updateSubject(${sem.id},${sub.id},'credits',parseInt(this.value)||1)" /></td>
      <td><select onchange="updateSubject(${sem.id},${sub.id},'grade',this.value)">${opts}</select></td>
      <td style="padding:9px 10px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#666;">${pts}</td>
      <td><button class="del-subj" onclick="removeSubject(${sem.id},${sub.id})">×</button></td>
    </tr>`;
  }).join('');

  let html = `
    <div class="sem-top">
      <span class="sem-name"><span class="badge">S${sem.id}</span>Semester ${sem.id}</span>
      <div class="sem-right">
        <div>
          <div class="sem-gpa-label">GPA</div>
          <div class="sem-gpa-val">${gpa.toFixed(2)}</div>
        </div>
        <button class="del-sem" onclick="removeSemester(${sem.id})">Remove</button>
      </div>
    </div>
    <div class="sem-body">
      <table class="subj-table">
        <thead><tr><th style="width:35%">Subject</th><th style="width:18%">Credits</th><th style="width:22%">Grade</th><th style="width:15%">Points</th><th style="width:10%"></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button class="add-subj" onclick="handleAddSubject(${sem.id})">+ Add Subject</button>
    </div>`;

  if (existing) {
    existing.innerHTML = html;
  } else {
    let div = document.createElement('div');
    div.className = 'sem-card';
    div.id = 'sem-' + sem.id;
    div.innerHTML = html;
    document.getElementById('semesters').appendChild(div);
  }
}

// ---- calculations ----

function calcSemGPA(sem) {
  let tc = 0, tp = 0;
  for (let s of sem.subjects) {
    if (s.credits > 0 && grades[s.grade] !== undefined) {
      tc += s.credits;
      tp += s.credits * grades[s.grade];
    }
  }
  return tc > 0 ? tp / tc : 0;
}

function calcOverall() {
  let tc = 0, tp = 0;
  for (let sem of semesters) {
    for (let s of sem.subjects) {
      if (s.credits > 0 && grades[s.grade] !== undefined) {
        tc += s.credits;
        tp += s.credits * grades[s.grade];
      }
    }
  }
  return { cgpa: tc > 0 ? tp / tc : 0, credits: tc, points: tp };
}

function recalc() {
  let { cgpa, credits } = calcOverall();

  document.getElementById('cgpa-display').textContent = cgpa.toFixed(2);
  document.getElementById('credits-display').textContent = credits;
  document.getElementById('sem-count').textContent = semesters.length;
  document.getElementById('cgpa-bar').style.width = (cgpa / 10 * 100) + '%';

  // best semester gpa
  let best = 0;
  for (let sem of semesters) {
    let g = calcSemGPA(sem);
    if (g > best && sem.subjects.length > 0) best = g;
  }
  document.getElementById('best-gpa').textContent = best > 0 ? best.toFixed(1) : '—';

  save();
}

// ---- what-if mode ----

function updateWhatIfStats() {
  let { cgpa, credits } = calcOverall();
  document.getElementById('wi-cgpa').textContent = cgpa.toFixed(2);
  document.getElementById('wi-credits').textContent = credits;
  document.getElementById('wi-sems').textContent = semesters.length;
}

function runSimulation() {
  let target = parseFloat(document.getElementById('target-cgpa').value) || 8.5;
  let remSems = parseInt(document.getElementById('rem-sems').value) || 4;
  let credPerSem = parseInt(document.getElementById('cred-per-sem').value) || 22;

  let { credits: curCredits, points: curPoints } = calcOverall();
  let futCredits = remSems * credPerSem;
  let totalNeeded = target * (curCredits + futCredits);
  let futPointsNeeded = totalNeeded - curPoints;
  let reqGPA = futCredits > 0 ? futPointsNeeded / futCredits : 0;

  let color, msg;
  if (reqGPA <= 0) {
    color = 'green';
    msg = "You've already hit your target! Just don't slack off.";
  } else if (reqGPA <= 7.5) {
    color = 'green';
    msg = `Totally doable. Maintain ~${reqGPA.toFixed(2)} GPA each semester.`;
  } else if (reqGPA <= 9.0) {
    color = 'yellow';
    msg = `Tough but possible. You'll need consistent ${reqGPA.toFixed(2)} GPA — aim for A+ and O grades.`;
  } else if (reqGPA <= 10.0) {
    color = 'yellow';
    msg = `Very hard. You need near-perfect ${reqGPA.toFixed(2)} GPA every semester.`;
  } else {
    color = 'red';
    msg = `Not possible to reach ${target.toFixed(2)} with ${remSems} semesters left. Try a lower target.`;
  }

  let display = Math.min(Math.max(reqGPA, 0), 10);

  document.getElementById('sim-result').style.display = 'block';
  document.getElementById('sim-result').innerHTML = `
    <div class="result-num ${color}">${display.toFixed(2)}</div>
    <div class="result-sub">Required GPA per semester for ${target.toFixed(2)} CGPA</div>
    <div class="result-msg ${color}">${msg}</div>
  `;

  // show future semester section
  document.getElementById('future-section').style.display = 'block';
  futureList = [];
  fSemId = 0;
  document.getElementById('future-sems').innerHTML = '';
  document.getElementById('projection').style.display = 'none';
}

// ---- future semester simulation ----

function addFutureSem() {
  fSemId++;
  let fs = { id: fSemId, subjects: [{ id: Date.now(), name: '', credits: 3, grade: 'A' }] };
  futureList.push(fs);
  renderFutureSem(fs);
  updateProjection();
}

function renderFutureSem(fs) {
  let el = document.getElementById('fsem-' + fs.id);
  let gpa = calcSemGPA(fs);

  let rows = fs.subjects.map(sub => {
    let opts = gradeList.map(g =>
      `<option value="${g}" ${g === sub.grade ? 'selected' : ''}>${g} (${grades[g]})</option>`
    ).join('');
    return `<tr class="subj-row">
      <td><input type="text" placeholder="Subject" value="${esc(sub.name)}" onchange="updateFSub(${fs.id},${sub.id},'name',this.value)" /></td>
      <td><input type="number" min="1" max="10" value="${sub.credits}" onchange="updateFSub(${fs.id},${sub.id},'credits',parseInt(this.value)||1)" /></td>
      <td><select onchange="updateFSub(${fs.id},${sub.id},'grade',this.value)">${opts}</select></td>
    </tr>`;
  }).join('');

  let html = `
    <div class="f-sem-top">
      <span class="f-sem-title">Future Sem ${fs.id}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="f-sem-gpa">${gpa.toFixed(2)}</span>
        <button class="del-subj" onclick="removeFSem(${fs.id})">×</button>
      </div>
    </div>
    <table class="subj-table">
      <thead><tr><th>Subject</th><th>Credits</th><th>Grade</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="add-subj" onclick="addFSubject(${fs.id})">+ Add Subject</button>
  `;

  if (el) {
    el.innerHTML = html;
  } else {
    let div = document.createElement('div');
    div.className = 'f-sem';
    div.id = 'fsem-' + fs.id;
    div.innerHTML = html;
    document.getElementById('future-sems').appendChild(div);
  }
}

function addFSubject(fsId) {
  let fs = futureList.find(f => f.id === fsId);
  if (!fs) return;
  fs.subjects.push({ id: Date.now(), name: '', credits: 3, grade: 'A' });
  renderFutureSem(fs);
  updateProjection();
}

function updateFSub(fsId, subId, key, val) {
  let fs = futureList.find(f => f.id === fsId);
  if (!fs) return;
  let sub = fs.subjects.find(s => s.id === subId);
  if (!sub) return;
  sub[key] = val;
  renderFutureSem(fs);
  updateProjection();
}

function removeFSem(id) {
  futureList = futureList.filter(f => f.id !== id);
  let el = document.getElementById('fsem-' + id);
  if (el) el.remove();
  updateProjection();
}

function updateProjection() {
  if (futureList.length === 0) {
    document.getElementById('projection').style.display = 'none';
    return;
  }

  let { credits: cc, points: cp } = calcOverall();
  let fc = 0, fp = 0;

  for (let fs of futureList) {
    for (let s of fs.subjects) {
      if (s.credits > 0 && grades[s.grade] !== undefined) {
        fc += s.credits;
        fp += s.credits * grades[s.grade];
      }
    }
  }

  let projected = (cc + fc) > 0 ? (cp + fp) / (cc + fc) : 0;

  let proj = document.getElementById('projection');
  proj.style.display = 'block';
  proj.innerHTML = `
    <div class="proj-label">Projected CGPA</div>
    <div class="proj-num">${projected.toFixed(2)}</div>
    <div style="margin-top:6px;font-size:12px;color:#555;">
      ${cc + fc} total credits &middot; ${cp + fp} total grade points
    </div>
  `;
}

// ---- localStorage ----

function save() {
  try {
    localStorage.setItem('gf_data', JSON.stringify({ semesters, semId, subjId }));
  } catch(e) {}
}

function load() {
  try {
    let raw = localStorage.getItem('gf_data');
    if (!raw) return false;
    let data = JSON.parse(raw);
    semesters = data.semesters || [];
    semId = data.semId || 0;
    subjId = data.subjId || 0;
    semesters.forEach(s => renderSem(s));
    recalc();
    return semesters.length > 0;
  } catch(e) { return false; }
}

// init
if (!load()) addSemester();
