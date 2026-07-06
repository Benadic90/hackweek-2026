const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };
const GRADES = Object.keys(GRADE_POINTS);

let semesters = [];
let futureSemesters = [];
let semIdCounter = 0;
let subIdCounter = 0;
let fSemIdCounter = 0;

function switchTab(tab) {
  document.getElementById('btn-calc').classList.toggle('active', tab === 'calc');
  document.getElementById('btn-whatif').classList.toggle('active', tab === 'whatif');
  document.getElementById('tab-calc').classList.toggle('hidden', tab !== 'calc');
  document.getElementById('tab-whatif').classList.toggle('hidden', tab !== 'whatif');
  if (tab === 'whatif') updateWhatIfSummary();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================================
   CALCULATOR LOGIC
   ========================================================================== */

function addSemester() {
  semIdCounter++;
  const sem = { id: semIdCounter, subjects: [] };
  semesters.push(sem);
  addSubject(sem.id);
  renderSemesters();
}

function removeSemester(semId) {
  semesters = semesters.filter(s => s.id !== semId);
  renderSemesters();
}

function addSubject(semId) {
  const sem = semesters.find(s => s.id === semId);
  if (!sem) return;
  subIdCounter++;
  sem.subjects.push({ id: subIdCounter, name: '', credits: 3, grade: 'A' });
  renderSemesters();
}

function removeSubject(semId, subId) {
  const sem = semesters.find(s => s.id === semId);
  if (!sem) return;
  sem.subjects = sem.subjects.filter(s => s.id !== subId);
  renderSemesters();
}

function updateSubject(semId, subId, field, value) {
  const sem = semesters.find(s => s.id === semId);
  if (!sem) return;
  const sub = sem.subjects.find(s => s.id === subId);
  if (!sub) return;
  sub[field] = value;
  updateStats();
}

function renderSemesters() {
  const container = document.getElementById('semesters');
  container.innerHTML = semesters.map(sem => {
    const semGpa = calculateSemGPA(sem);
    const rows = sem.subjects.map(sub => `
      <tr>
        <td>
          <input type="text" class="form-control" placeholder="Course Name" value="${escapeHtml(sub.name)}" onchange="updateSubject(${sem.id}, ${sub.id}, 'name', this.value)">
        </td>
        <td>
          <input type="number" class="form-control" min="1" max="10" value="${sub.credits}" onchange="updateSubject(${sem.id}, ${sub.id}, 'credits', parseInt(this.value)||0); renderSemesters()">
        </td>
        <td>
          <select class="form-control" onchange="updateSubject(${sem.id}, ${sub.id}, 'grade', this.value); renderSemesters()">
            ${GRADES.map(g => `<option value="${g}" ${g === sub.grade ? 'selected' : ''}>${g} (${GRADE_POINTS[g]})</option>`).join('')}
          </select>
        </td>
        <td class="text-muted">
          ${sub.credits * (GRADE_POINTS[sub.grade] || 0)}
        </td>
        <td>
          <button class="btn-danger-link" onclick="removeSubject(${sem.id}, ${sub.id})">Remove</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="semester-item">
        <div class="semester-header">
          <span class="semester-title">Semester ${sem.id}</span>
          <div class="semester-actions">
            <span class="semester-gpa text-muted">GPA: ${semGpa.toFixed(2)}</span>
            <button class="btn-danger-link" onclick="removeSemester(${sem.id})">Delete Semester</button>
          </div>
        </div>
        <div class="semester-body">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Subject</th>
                <th style="width: 20%">Credits</th>
                <th style="width: 20%">Grade</th>
                <th style="width: 10%">Points</th>
                <th style="width: 10%"></th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <button class="btn btn-outline" onclick="addSubject(${sem.id})">+ Add Subject</button>
        </div>
      </div>
    `;
  }).join('');
  
  updateStats();
}

function calculateSemGPA(sem) {
  let totalCredits = 0, totalPoints = 0;
  sem.subjects.forEach(sub => {
    if (sub.credits > 0 && GRADE_POINTS[sub.grade] !== undefined) {
      totalCredits += sub.credits;
      totalPoints += sub.credits * GRADE_POINTS[sub.grade];
    }
  });
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function calculateOverall() {
  let totalCredits = 0, totalPoints = 0;
  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      if (sub.credits > 0 && GRADE_POINTS[sub.grade] !== undefined) {
        totalCredits += sub.credits;
        totalPoints += sub.credits * GRADE_POINTS[sub.grade];
      }
    });
  });
  return { cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0, credits: totalCredits, points: totalPoints };
}

function updateStats() {
  const { cgpa, credits } = calculateOverall();
  document.getElementById('cgpa-display').textContent = cgpa.toFixed(2);
  document.getElementById('credits-display').textContent = credits;
  document.getElementById('sem-count').textContent = semesters.length;
  document.getElementById('cgpa-bar').style.width = (cgpa / 10 * 100) + '%';

  let best = 0;
  semesters.forEach(sem => {
    const gpa = calculateSemGPA(sem);
    if (gpa > best && sem.subjects.length > 0) best = gpa;
  });
  document.getElementById('best-gpa').textContent = best > 0 ? best.toFixed(2) : '—';
  
  saveData();
}

/* ==========================================================================
   WHAT-IF LOGIC
   ========================================================================== */

function updateWhatIfSummary() {
  const { cgpa, credits } = calculateOverall();
  document.getElementById('wi-cgpa').textContent = cgpa.toFixed(2);
  document.getElementById('wi-credits').textContent = credits;
  document.getElementById('wi-sems').textContent = semesters.length;
}

function runSimulation() {
  const target = parseFloat(document.getElementById('target-cgpa').value) || 0;
  const remSems = parseInt(document.getElementById('rem-sems').value) || 1;
  const credPerSem = parseInt(document.getElementById('cred-per-sem').value) || 1;

  const { credits: currentCredits, points: currentPoints } = calculateOverall();
  const futureCredits = remSems * credPerSem;
  const totalNeededCredits = currentCredits + futureCredits;
  const totalPointsNeeded = target * totalNeededCredits;
  const pointsToEarn = totalPointsNeeded - currentPoints;
  const reqGPA = futureCredits > 0 ? pointsToEarn / futureCredits : 0;

  const resultContainer = document.getElementById('sim-result');
  resultContainer.classList.remove('hidden');

  let statusClass, message;
  if (reqGPA <= 0) {
    statusClass = 'color-success';
    message = 'You have already achieved the target.';
  } else if (reqGPA <= 7.5) {
    statusClass = 'color-success';
    message = 'Highly achievable target.';
  } else if (reqGPA <= 9.0) {
    statusClass = 'color-warning';
    message = 'Challenging, but possible with effort.';
  } else if (reqGPA <= 10.0) {
    statusClass = 'color-danger';
    message = 'Very difficult. Near-perfect scores required.';
  } else {
    statusClass = 'color-danger';
    message = 'Impossible to achieve with the given remaining credits.';
  }

  const displayGPA = Math.min(Math.max(reqGPA, 0), 10);

  resultContainer.innerHTML = `
    <div class="result-gpa ${statusClass}">${displayGPA.toFixed(2)}</div>
    <div class="text-muted" style="margin-bottom: 12px;">Required GPA per remaining semester</div>
    <div class="${statusClass}">${message}</div>
  `;

  document.getElementById('future-section').classList.remove('hidden');
  futureSemesters = [];
  document.getElementById('future-sems').innerHTML = '';
  document.getElementById('projection').classList.add('hidden');
}

/* ==========================================================================
   FUTURE SEMESTER DETAILED PLANNER
   ========================================================================== */

function addFutureSem() {
  fSemIdCounter++;
  const fs = { id: fSemIdCounter, subjects: [{ id: Date.now(), name: '', credits: 3, grade: 'A' }] };
  futureSemesters.push(fs);
  renderFutureSemesters();
}

function removeFutureSem(fsId) {
  futureSemesters = futureSemesters.filter(fs => fs.id !== fsId);
  renderFutureSemesters();
}

function addFutureSubject(fsId) {
  const fs = futureSemesters.find(f => f.id === fsId);
  if (!fs) return;
  fs.subjects.push({ id: Date.now(), name: '', credits: 3, grade: 'A' });
  renderFutureSemesters();
}

function updateFutureSubject(fsId, subId, field, value) {
  const fs = futureSemesters.find(f => f.id === fsId);
  if (!fs) return;
  const sub = fs.subjects.find(s => s.id === subId);
  if (!sub) return;
  sub[field] = value;
  updateProjection();
}

function renderFutureSemesters() {
  const container = document.getElementById('future-sems');
  container.innerHTML = futureSemesters.map(fs => {
    const fsGpa = calculateSemGPA(fs);
    const rows = fs.subjects.map(sub => `
      <tr>
        <td>
          <input type="text" class="form-control" placeholder="Subject" value="${escapeHtml(sub.name)}" onchange="updateFutureSubject(${fs.id}, ${sub.id}, 'name', this.value)">
        </td>
        <td>
          <input type="number" class="form-control" min="1" max="10" value="${sub.credits}" onchange="updateFutureSubject(${fs.id}, ${sub.id}, 'credits', parseInt(this.value)||0); renderFutureSemesters()">
        </td>
        <td>
          <select class="form-control" onchange="updateFutureSubject(${fs.id}, ${sub.id}, 'grade', this.value); renderFutureSemesters()">
            ${GRADES.map(g => `<option value="${g}" ${g === sub.grade ? 'selected' : ''}>${g} (${GRADE_POINTS[g]})</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    return `
      <div class="semester-item">
        <div class="semester-header">
          <span class="semester-title">Future Semester ${fs.id}</span>
          <div class="semester-actions">
            <span class="semester-gpa text-muted">GPA: ${fsGpa.toFixed(2)}</span>
            <button class="btn-danger-link" onclick="removeFutureSem(${fs.id})">Delete</button>
          </div>
        </div>
        <div class="semester-body">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 50%">Subject</th>
                <th style="width: 25%">Credits</th>
                <th style="width: 25%">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <button class="btn btn-outline" onclick="addFutureSubject(${fs.id})">+ Add Subject</button>
        </div>
      </div>
    `;
  }).join('');
  updateProjection();
}

function updateProjection() {
  const projCard = document.getElementById('projection');
  if (futureSemesters.length === 0) {
    projCard.classList.add('hidden');
    return;
  }

  let { credits: curCredits, points: curPoints } = calculateOverall();
  let futCredits = 0, futPoints = 0;

  futureSemesters.forEach(fs => {
    fs.subjects.forEach(sub => {
      if (sub.credits > 0 && GRADE_POINTS[sub.grade] !== undefined) {
        futCredits += sub.credits;
        futPoints += sub.credits * GRADE_POINTS[sub.grade];
      }
    });
  });

  const totalCredits = curCredits + futCredits;
  const totalPoints = curPoints + futPoints;
  const projectedCGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

  projCard.classList.remove('hidden');
  projCard.innerHTML = `
    <h3 style="margin-bottom: 8px;">Projected CGPA</h3>
    <div style="font-size: 32px; font-weight: 300;">${projectedCGPA.toFixed(2)}</div>
    <div class="text-muted">Total Credits: ${totalCredits} | Total Points: ${totalPoints}</div>
  `;
}

/* ==========================================================================
   PERSISTENCE & INIT
   ========================================================================== */

function saveData() {
  try {
    localStorage.setItem('cgpa_calc_data', JSON.stringify({ semesters, semIdCounter, subIdCounter }));
  } catch (e) {}
}

function loadData() {
  try {
    const raw = localStorage.getItem('cgpa_calc_data');
    if (!raw) return false;
    const data = JSON.parse(raw);
    semesters = data.semesters || [];
    semIdCounter = data.semIdCounter || 0;
    subIdCounter = data.subIdCounter || 0;
    renderSemesters();
    return semesters.length > 0;
  } catch (e) {
    return false;
  }
}

if (!loadData()) {
  addSemester();
}
