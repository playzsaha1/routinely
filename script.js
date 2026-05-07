let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("addBtn");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const transactionsEl = document.getElementById("transactions");

const budgetInput = document.getElementById("budgetInput");
const budgetBtn = document.getElementById("budgetBtn");
const budgetText = document.getElementById("budgetText");
const insightText = document.getElementById("insightText");
const themeBtn = document.getElementById("themeBtn");

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("budget", budget);
}

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

function updateUI() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  balanceEl.textContent = formatMoney(balance);
  incomeEl.textContent = formatMoney(income);
  expensesEl.textContent = formatMoney(expenses);

  transactionsEl.innerHTML = "";

  if (transactions.length === 0) {
    transactionsEl.innerHTML = "<p>No transactions yet.</p>";
  }

  transactions.slice().reverse().forEach(transaction => {
    const div = document.createElement("div");
    div.className = "transaction";

    div.innerHTML = `
      <div class="transaction-left">
        <strong>${transaction.title}</strong>
        <span>${transaction.category}</span>
      </div>

      <div>
        <strong class="${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount)}
        </strong>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">×</button>
      </div>
    `;

    transactionsEl.appendChild(div);
  });

  updateBudget(expenses);
  updateInsight(expenses);
}

function addTransaction() {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!title || !amount || amount <= 0) {
    alert("Please enter a valid transaction name and amount.");
    return;
  }

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category
  };

  transactions.push(transaction);

  titleInput.value = "";
  amountInput.value = "";

  saveData();
  updateUI();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

function updateBudget(expenses) {
  if (budget <= 0) {
    budgetText.textContent = "No budget set.";
    budgetText.className = "";
    return;
  }

  const remaining = budget - expenses;

  if (remaining >= 0) {
    budgetText.textContent = `Budget: ${formatMoney(budget)} | Remaining: ${formatMoney(remaining)}`;
    budgetText.className = "";
  } else {
    budgetText.textContent = `Warning: You are ${formatMoney(Math.abs(remaining))} over budget.`;
    budgetText.className = "warning";
  }
}

function saveBudget() {
  const value = Number(budgetInput.value);

  if (!value || value <= 0) {
    alert("Please enter a valid budget.");
    return;
  }

  budget = value;
  budgetInput.value = "";
  saveData();
  updateUI();
}

function updateInsight(expenses) {
  const expenseTransactions = transactions.filter(t => t.type === "expense");

  if (expenseTransactions.length === 0) {
    insightText.textContent = "Add expenses to see insights.";
    return;
  }

  const categoryTotals = {};

  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  insightText.textContent = `You spent the most on ${topCategory[0]}: ${formatMoney(topCategory[1])}.`;
}

function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeBtn.textContent = isLight ? "☀️" : "🌙";
}

addBtn.addEventListener("click", addTransaction);
budgetBtn.addEventListener("click", saveBudget);
themeBtn.addEventListener("click", toggleTheme);

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeBtn.textContent = "☀️";
}

updateUI();