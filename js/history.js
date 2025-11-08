// history.js
import { auth, db } from "../js/firebase-config.js";
import { collection, getDocs, where, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Globals
let allBudgets = [];
let allTransactions = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentMode = ""; // 'budget' or 'transaction'
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Elements
const budgetCard = document.getElementById('budgetCard');
const transactionCard = document.getElementById('transactionCard');
const searchArea = document.getElementById('searchArea');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const spinner = document.getElementById('spinner');
const resetBtn = document.getElementById('resetBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');
const tableCard = document.querySelector('.table-card');
const searchHead=document.querySelector('.searchHead');
const head = document.querySelector('.historyHead');



// Listen for auth state change

let currentUserId = null;


auth.onAuthStateChanged((user) => {
  if (user) {
    currentUserId = user.uid;
  } else {
    console.log("User not logged in.");
    currentUserId = null;
  }
});




 //Budget click
budgetCard.addEventListener('click', () => {
  currentMode = 'budget';
  fetchBudgets();
  searchArea.style.display = "flex";
  searchArea.classList.remove('hidden');
  tableCard.classList.remove('hidden');
  searchHead.classList.remove('hidden');
  head.classList.remove('hidden');
  head.innerHTML = `<h2>Budget History</h2>`;
 
 
});

// Transaction click
transactionCard.addEventListener('click', () => {
  currentMode = 'transaction';
  fetchTransactions();
  searchArea.style.display = "flex";
  
  searchArea.classList.remove('hidden');
  tableCard.classList.remove('hidden');
  searchHead.classList.remove('hidden');
  head.classList.remove('hidden');
  head.innerHTML = `<h2>Transactions History</h2>`;
  
});

//Budget click
budgetCard.addEventListener('click', () => {
  currentMode = 'budget';
  fetchBudgets();
  searchArea.classList.remove('hidden');
  tableCard.classList.remove('hidden');
});

// Transaction click
transactionCard.addEventListener('click', () => {
  currentMode = 'transaction';
  fetchTransactions();
  searchArea.classList.remove('hidden');
  tableCard.classList.remove('hidden');
});



// Event Listeners
budgetCard.addEventListener('click', () => {

  currentMode = 'budget';
  fetchBudgets();
});

transactionCard.addEventListener('click', () => {
  currentMode = 'transaction';
  fetchTransactions();
});

resetBtn.addEventListener('click', () => {
  currentPage = 1;
  renderTable(currentMode === 'budget' ? allBudgets : allTransactions);
  clearSearchInputs();
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentMode === 'budget' ? allBudgets : allTransactions);
  }
});

nextPageBtn.addEventListener('click', () => {
  const data = currentMode === 'budget' ? allBudgets : allTransactions;
  if (currentPage * rowsPerPage < data.length) {
    currentPage++;
    renderTable(data);
  }
});



downloadPdfBtn.addEventListener('click', downloadPDF);

// Fetch Functions
async function fetchBudgets() {
  showSpinner();

  if (auth.currentUser) { // Directly check auth.currentUser
    const currentUserId = auth.currentUser.uid;

    try {
      const budgetsCollection = collection(db, "users", currentUserId, "budgets");
      const q = query(budgetsCollection, orderBy("month", "desc"));
      const snapshot = await getDocs(q);
      allBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderBudgetSearch();
      currentPage = 1;
      await calculateRemainingBudgets(); // Await the calculation
      renderTable(allBudgets); // Render table AFTER calculation
    } catch (error) {
      console.log("fetch budget", error);
    } finally {
      hideSpinner();
    }
  } else {
    console.log("User not logged in.");
    hideSpinner();
  }

}


async function fetchTransactions() {
  showSpinner();

  if (auth.currentUser) {
    const currentUserId = auth.currentUser.uid;

    try {
      const transactionsCollection = collection(db, "users", currentUserId, "transactions");
      const q = query(transactionsCollection, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderTransactionSearch();
      currentPage = 1;
      renderTable(allTransactions);
    }

    catch (error) {
      console.log("fetch transac", error);
    }
    finally {
      hideSpinner();
    }
  } else {
    console.log("fetch transac");
  }

}

// Calculate Remaining Budgets
async function calculateRemainingBudgets() {
  if (auth.currentUser) {
    const currentUserId = auth.currentUser.uid;
    try {
      for (const budget of allBudgets) {
        let totalExpensesForMonth = 0;

        const transactionsCollection = collection(db, "users", currentUserId, "transactions");
        const transactionsSnapshot = await getDocs(transactionsCollection);

        transactionsSnapshot.forEach(transactionDoc => {
          const transactionData = transactionDoc.data();
          const transactionDate = transactionData.timestamp?.toDate();
          if (transactionDate && transactionDate.getMonth() + 1 === budget.month && transactionDate.getFullYear() === budget.year) {
            totalExpensesForMonth += parseFloat(transactionData.amount) || 0;
          }
        });

        budget.totalExpenses = totalExpensesForMonth;

        const budgetAmount = parseFloat(budget.amount) || 0;
        const remaining = budgetAmount - totalExpensesForMonth;
        budget.remaining = remaining.toFixed(2);
      }
    } catch (error) {
      console.log("remaining expenses", error);
    }
  } else {
    console.log("No user logged in");
  }
}

// Render Functions
function renderTable(data) {
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (currentMode === 'budget') {
    tableHead.innerHTML = `
      <tr>
        <th>Serial No.</th>
        <th>Month & Year</th>
        <th>Budget</th>
        <th>Total Expenses</th>
        <th>Remaining Budget</th>
      </tr>
    `;
  } else {
    tableHead.innerHTML = `
      <tr>
        <th>Serial No.</th>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Description</th>
      </tr>
    `;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  paginatedData.forEach((item, index) => {
    const row = document.createElement('tr');
    if (currentMode === 'budget') {
      const formattedMonthYear = `${monthNames[item.month - 1]} / ${item.year}`;
      row.innerHTML = `
        <td>${(currentPage - 1) * rowsPerPage + index + 1}</td>
        <td>${formattedMonthYear}</td>
        <td>${item.amount ? parseFloat(item.amount).toFixed(2) : '0.00'}</td>
        <td>${item.totalExpenses !== undefined ? parseFloat(item.totalExpenses).toFixed(2) : '0.00'}</td>
        <td>${item.remaining !== undefined ? parseFloat(item.remaining).toFixed(2) : '0.00'}</td>
      `;
    } else {
      const date = formatFullTimestamp(item.timestamp); // Use formatFullTimestamp here

      row.innerHTML = `
        <td>${start + index + 1}</td>
        <td>${date}</td>
        <td>${item.type || ''}</td>
        <td>${item.amount || ''}</td>
        <td>${item.description || ''}</td>
      `;
    }
    tableBody.appendChild(row);
  });

  pageIndicator.textContent = `Page ${currentPage} of ${Math.ceil(data.length / rowsPerPage)}`;
}

// Search Functions
function renderBudgetSearch() {
  
  searchArea.innerHTML = `
    <input type="month" id="searchMonthYear" />
    <button onclick="searchBudget()">Search</button>
  `;
}

function renderTransactionSearch() {
  searchArea.innerHTML = `
    
    <select id="searchMode">
      <option value="date">Search by Date</option>
      <option value="month">Search by Month & Year</option>
    </select>
    <input type="date" id="searchDate" />
    <input type="month" id="searchMonthYear" style="display:none;" />
    <button onclick="searchTransaction()">Search</button>
  `;
  const searchMode = document.getElementById('searchMode');
  const searchDate = document.getElementById('searchDate');
  const searchMonthYear = document.getElementById('searchMonthYear');

  searchMode.addEventListener('change', () => {
    searchDate.style.display = searchMode.value === 'date' ? 'inline-block' : 'none';
    searchMonthYear.style.display = searchMode.value === 'month' ? 'inline-block' : 'none';
  });
}


// Function to clear search inputs
function clearSearchInputs() {
  if (currentMode === 'budget') {
    document.getElementById('searchMonthYear').value = '';
  } else if (currentMode === 'transaction') {
    document.getElementById('searchDate').value = '';
    document.getElementById('searchMonthYear').value = '';
  }
}

window.searchBudget = function () {
  const input = document.getElementById('searchMonthYear').value;
  if (!input) return;
  const [year, month] = input.split('-');
  const filtered = allBudgets.filter(item => {
    return item.year == year && item.month == month;
  });
  renderTable(filtered);
};

window.searchTransaction = function () {
  const mode = document.getElementById('searchMode').value;
  const inputDate = document.getElementById('searchDate').value;
  const inputMonthYear = document.getElementById('searchMonthYear').value;

  if (mode === 'date' && inputDate) {
    const dateInput = new Date(inputDate);
    const filtered = allTransactions.filter(item => {
      const itemDate = new Date(item.timestamp.seconds * 1000);
      return itemDate.toDateString() === dateInput.toDateString();
    });
    renderTable(filtered);
  } else if (mode === 'month' && inputMonthYear) {
    const [year, month] = inputMonthYear.split('-');
    const filtered = allTransactions.filter(item => {
      const itemDate = new Date(item.timestamp.seconds * 1000);
      return itemDate.getFullYear() == year && (itemDate.getMonth() + 1) == month;
    });
    renderTable(filtered);
  }
};

// Spinner Functions
function showSpinner() {
  spinner.style.display = 'flex';
}

function hideSpinner() {
  spinner.style.display = 'none';

}


function formatFullTimestamp(timestamp) {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString(); // Returns full date string
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Step 1: Fetch a font that supports Unicode (like DejaVu Sans)
  const fontUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
  const fontBinary = await fetch(fontUrl).then(res => res.arrayBuffer());

  // Step 2: Convert the font to Base64
  const fontBase64 = btoa(
    new Uint8Array(fontBinary)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  // Step 3: Add font to jsPDF
  doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.setFont('NotoSans'); // Use the Unicode-safe font

  const headers = [];
  const rows = [];

  // Get table headers
  Array.from(tableHead.querySelectorAll('th')).forEach(th => {
    headers.push(th.textContent);
  });

  // Get table rows
  Array.from(tableBody.querySelectorAll('tr')).forEach(tr => {
    const rowData = [];
    Array.from(tr.querySelectorAll('td')).forEach(td => {
      rowData.push(td.textContent);
    });
    rows.push(rowData);
  });

  // Step 4: Generate PDF Table
  doc.autoTable({
    head: [headers],
    body: rows,
    styles: {
      font: 'NotoSans', // Make sure autoTable also uses the font
    }
  });

  // Step 5: Save PDF
  doc.save(`${currentMode}_history.pdf`);
}



