// App State
let expenses = JSON.parse(localStorage.getItem('et_expenses')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('et_budget')) || 0;

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalExpensesEl = document.getElementById('total-expenses');
const budgetDisplayEl = document.getElementById('monthly-budget-display');
const budgetAlert = document.getElementById('budget-alert');

// Chart Instance
let expenseChart;

// Setup Chart
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  
  // Custom colors for categories
  const colors = [
    '#0366d6', '#28a745', '#ea4a5a', '#dbab09', 
    '#6f42c1', '#17a2b8', '#6a737d'
  ];

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 12 } }
        }
      }
    }
  });
}

// Update Chart Data
function updateChart() {
  const categoryTotals = {};
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  expenseChart.data.labels = Object.keys(categoryTotals);
  expenseChart.data.datasets[0].data = Object.values(categoryTotals);
  expenseChart.update();
}

// Set Budget
function setBudget() {
  const newBudget = prompt("Enter your monthly budget:", monthlyBudget);
  if (newBudget !== null && !isNaN(newBudget) && newBudget >= 0) {
    monthlyBudget = parseFloat(newBudget);
    localStorage.setItem('et_budget', monthlyBudget);
    updateUI();
  }
}

// Add Expense
expenseForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const desc = document.getElementById('desc').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;

  const expense = {
    id: Date.now().toString(),
    desc,
    amount,
    date,
    category
  };

  expenses.push(expense);
  saveData();
  
  // Reset form
  expenseForm.reset();
  
  updateUI();
});

// Delete Expense
function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveData();
  updateUI();
}

// Update UI
function updateUI() {
  // Clear list
  expenseList.innerHTML = '';
  
  let total = 0;

  // Sort expenses by date descending
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedExpenses.forEach(exp => {
    total += exp.amount;
    
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.innerHTML = `
      <div class="expense-info">
        <div class="expense-desc">${escapeHtml(exp.desc)}</div>
        <div class="expense-meta">${exp.date} &middot; ${exp.category}</div>
      </div>
      <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
      <button class="btn-delete" onclick="deleteExpense('${exp.id}')">Delete</button>
    `;
    expenseList.appendChild(div);
  });

  // Update Stats
  totalExpensesEl.textContent = `$${total.toFixed(2)}`;
  budgetDisplayEl.textContent = monthlyBudget > 0 ? `$${monthlyBudget.toFixed(2)}` : 'Not set';

  // Budget Alert
  if (monthlyBudget > 0 && total > monthlyBudget) {
    budgetAlert.style.display = 'block';
  } else {
    budgetAlert.style.display = 'none';
  }

  // Update Chart
  updateChart();
}

// Utility function to prevent XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Save to LocalStorage
function saveData() {
  localStorage.setItem('et_expenses', JSON.stringify(expenses));
}

// Init Application
initChart();
updateUI();

// Set default date to today
document.getElementById('date').valueAsDate = new Date();
