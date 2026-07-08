// Grab DOM elements
const form = document.getElementById('add-habit-form');
const input = document.getElementById('habit-input');
const container = document.getElementById('habits-container');
const emptyState = document.getElementById('empty-state');

// Load habits from local storage, or start with an empty array
let habits = JSON.parse(localStorage.getItem('habitsData')) || [];

// Calculate the last 30 days once so we can use it to build the calendars
const last30Days = [];
for (let i = 29; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  // Format as YYYY-MM-DD
  const dateString = d.toISOString().split('T')[0];
  
  last30Days.push({
    dateString: dateString,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // e.g. "Jul 8"
  });
}

// Add a new habit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  
  if (title) {
    const newHabit = {
      id: Date.now().toString(),
      title: title,
      completedDates: [] // Array of YYYY-MM-DD strings
    };
    
    habits.push(newHabit);
    saveData();
    input.value = '';
    render();
  }
});

// Toggle a specific day for a habit
function toggleDay(habitId, dateString) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  
  const index = habit.completedDates.indexOf(dateString);
  
  if (index > -1) {
    // If already completed, un-complete it
    habit.completedDates.splice(index, 1);
  } else {
    // Otherwise, mark it completed
    habit.completedDates.push(dateString);
  }
  
  saveData();
  render();
}

// Delete a habit entirely
function deleteHabit(habitId) {
  if (confirm('Are you sure you want to delete this habit?')) {
    habits = habits.filter(h => h.id !== habitId);
    saveData();
    render();
  }
}

// Save to browser's local storage
function saveData() {
  localStorage.setItem('habitsData', JSON.stringify(habits));
}

// Calculate the current streak
function calculateStreak(completedDates) {
  let streak = 0;
  
  // We check starting from today, going backwards
  for (let i = 29; i >= 0; i--) {
    const dateStr = last30Days[i].dateString;
    const isToday = i === 29;
    
    if (completedDates.includes(dateStr)) {
      streak++;
    } else {
      // If it's today and we haven't done it yet, don't break the streak just yet!
      if (!isToday) {
        break;
      }
    }
  }
  
  return streak;
}

// Draw the UI
function render() {
  // Show or hide empty state
  if (habits.length === 0) {
    emptyState.classList.remove('hidden');
    container.innerHTML = '';
    return;
  }
  
  emptyState.classList.add('hidden');
  container.innerHTML = '';
  
  // Create a card for each habit
  habits.forEach(habit => {
    const streak = calculateStreak(habit.completedDates);
    
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    // 1. Header (Title + Stats + Delete)
    const header = document.createElement('div');
    header.className = 'habit-header';
    header.innerHTML = `
      <div class="habit-title">${habit.title}</div>
      <div class="habit-stats">
        <div class="streak-badge">🔥 ${streak} Day Streak</div>
        <button class="delete-btn" onclick="deleteHabit('${habit.id}')" title="Delete Habit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    card.appendChild(header);
    
    // 2. The 30-day calendar wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'calendar-wrapper';
    
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    
    // Generate the 30 squares
    last30Days.forEach((day, index) => {
      const isDone = habit.completedDates.includes(day.dateString);
      
      const dayBox = document.createElement('div');
      dayBox.className = 'day-box';
      
      // The clickable square
      const square = document.createElement('div');
      square.className = `day-square ${isDone ? 'done' : ''}`;
      square.title = `${day.label} (Click to toggle)`;
      square.onclick = () => toggleDay(habit.id, day.dateString);
      
      // The little date label under the square
      const label = document.createElement('div');
      label.className = 'day-label';
      // Only show a label every 3 days to prevent crowding, but always show today
      if (index % 3 === 0 || index === 29) {
        label.textContent = index === 29 ? 'Today' : day.label.split(' ')[1]; // Just the day number
      } else {
        label.textContent = ' ';
      }
      
      dayBox.appendChild(square);
      dayBox.appendChild(label);
      grid.appendChild(dayBox);
    });
    
    wrapper.appendChild(grid);
    card.appendChild(wrapper);
    container.appendChild(card);
    
    // Automatically scroll the calendar to the right so "Today" is visible
    wrapper.scrollLeft = wrapper.scrollWidth;
  });
}

// Initial render
render();
