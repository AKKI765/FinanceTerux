import { auth, db } from "../js/firebase-config.js";
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// References
const budgetForm = document.getElementById('budgetForm');
const budgetAmountInput = document.getElementById('budgetAmount');
const monthYearInput = document.getElementById('monthYear');
const budgetFormCard = document.getElementById('budgetFormCard');
const budgetInfoCard = document.getElementById('budgetInfoCard');
const budgetMessage = document.getElementById('budgetMessage');

const budgetValue = document.getElementById('budgetValue');
const totalExpenses = document.getElementById('totalExpenses');
const remainingBudget = document.getElementById('remainingBudget');

const editBudgetBtn = document.getElementById('editBudgetBtn');
const deleteBudgetBtn = document.getElementById('deleteBudgetBtn');

const editModal = document.getElementById('editModal');
const editBudgetInput = document.getElementById('editBudgetInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

const messageAdd=document.querySelector('.showAddMessage');

const budgetTableBody = document.querySelector('#budgetTable tbody');


let currentUserId = null;

// Listen for auth state change
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUserId = user.uid;
   
    loadBudget(); // Load transactions when user logs in
  } else {
    
    currentUserId = null;
  }
});



function showAddMessage(text) {
  messageAdd.textContent = text;
  messageAdd.style.backgroundColor = "#d4edda";
  messageAdd.style.color = "#155724";
  messageAdd.style.padding = "10px";
  messageAdd.style.borderRadius = "8px";
  messageAdd.style.marginTop = "10px";
  messageAdd.style.textAlign = "center";
  messageAdd.style.fontWeight = "bold";
  messageAdd.style.transition = "all 0.5s ease";
}




let currentBudgetDocId = null;
let currentBudgetAmount = 0;

// Current Month and Year
const now = new Date();
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentMonthName = monthNames[now.getMonth()];
const currentMonth = now.getMonth(); // 0-indexed (Jan = 0)
const currentYear = now.getFullYear();
monthYearInput.value = `${(currentMonthName).toString().padStart(2, '0')} / ${currentYear}`;

document.getElementById('addBudgetHeading').textContent = `Add Budget: ${(currentMonthName).toString().padStart(2, '0')} / ${currentYear}`;
document.getElementById('budgetDetailHeading').textContent = `Budget Details For ${(currentMonthName).toString().padStart(2, '0')} / ${currentYear}`;


// Add Budget
budgetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(budgetAmountInput.value);

  if (!currentUserId) {
    showAddMessage("❌ You must be logged in to add the budget.");
    return;
  }

  try {

    const budgetsCollection = collection(db, "users", currentUserId, "budgets");

    const docRef = await addDoc(budgetsCollection, {
      amount,
      month: currentMonth + 1, // Save month as 1-indexed
      year: currentYear,
      createdAt: new Date()
    });

    currentBudgetDocId = docRef.id;
    currentBudgetAmount = amount;
    displayBudgetInfo();
  } catch (error) {
    console.error("Error adding budget:", error);
  }

  loadBudgetTable();
});

// Display Budget Info
async function displayBudgetInfo() {
  budgetFormCard.style.display = 'none';
  budgetInfoCard.style.display = 'block';
  budgetValue.textContent = currentBudgetAmount;

  await calculateTotalExpensesAndRemaining();
}

// Calculate Total Expenses and Remaining Budget
async function calculateTotalExpensesAndRemaining() {

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const currentUserId = user.uid;
     

      try {

        let total = 0;
        const transactionsCollection = collection(db, "users", currentUserId, "transactions");
        const snapshot = await getDocs(transactionsCollection);

        snapshot.forEach(doc => {
          const data = doc.data();
          const transactionDate = data.timestamp?.toDate(); // convert Firestore Timestamp to JS Date

          if (transactionDate) {
            const transactionMonth = transactionDate.getMonth(); // 0-indexed
            const transactionYear = transactionDate.getFullYear();

            if (transactionMonth === currentMonth && transactionYear === currentYear) {
              total += parseFloat(data.amount) || 0;
            }
          }
        });

        totalExpenses.textContent = total.toFixed(2);
        remainingBudget.textContent = (currentBudgetAmount - total).toFixed(2);

      } catch (error) {
        console.error("Error loading transactions:", error);
        showAddMessage("❌ Failed to load transactions.");

      }
    }
    else {
      console.error("Error loading transactions:", error);
    }
  })


}

// Edit Budget
editBudgetBtn.addEventListener('click', () => {
  editModal.classList.remove('hidden');
  editBudgetInput.value = currentBudgetAmount;

});

// Save Edited Budget
saveEditBtn.addEventListener('click', async (e) => {

  e.preventDefault();
  const newAmount = parseFloat(editBudgetInput.value);

  auth.onAuthStateChanged(async (user) => {

    if (user) {
      const currentUserId = user.uid;

      try {

        if (currentBudgetDocId) {
          const docRef = doc(db, "users", currentUserId, "budgets", currentBudgetDocId);
          await updateDoc(docRef, { amount: newAmount });

          currentBudgetAmount = newAmount;
          editModal.classList.add('hidden');
          displayBudgetInfo();
        }

        loadBudgetTable();

      }

      catch (error) {
        console.error("Error save edit:", error);
      }
    } else {
      console.error("Error save edit:");
    }

  })


});

// Close Edit Modal
closeModalBtn.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

// Delete Budget
// Show the delete modal on delete button click
deleteBudgetBtn.addEventListener('click', () => {
  if (currentBudgetDocId) {
    deleteModal.classList.remove('hidden');
  }
});

// Confirm delete
confirmDeleteBtn.addEventListener('click', async () => {


  auth.onAuthStateChanged(async (user) => {

    if (user) {
      const currentUserId = user.uid;

      try {



        if (currentBudgetDocId) {
          const docRef = doc(db, "users", currentUserId, "budgets", currentBudgetDocId);
          await deleteDoc(docRef);

          currentBudgetDocId = null;
          currentBudgetAmount = 0;
          budgetAmountInput.value = '';
          budgetFormCard.style.display = 'block';
          budgetInfoCard.style.display = 'none';
          budgetMessage.classList.add('hidden');

          deleteModal.classList.add('hidden');
        }

        loadBudgetTable();

      }

      catch (error) {
        console.error("Error Delete:", error);
      }
    } else {
      console.error("Error Delete:");
    }

  })

});

// Cancel delete
cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
});

// Load Budget if Already Exists
async function loadBudget() {

  auth.onAuthStateChanged(async (user) => {
    if (user) {

      const currentUserId = user.uid;
      
      try {
        const budgetsCollection = collection(db, "users", currentUserId, "budgets");
        const snapshot = await getDocs(budgetsCollection);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.month === currentMonth + 1 && data.year === currentYear) {
            currentBudgetDocId = docSnap.id;
            currentBudgetAmount = data.amount;
          }
        });

        if (currentBudgetDocId) {
          displayBudgetInfo();
        }

      } catch (error) {

      }

    } else {
      console.log("Load Budget", error)
    }
  })



}




// Load Budget Data into the Table for the current year
async function loadBudgetTable() {


  auth.onAuthStateChanged(async (user) => {

    if (user) {
      const currentUserId = user.uid;
     
      try {


        budgetTableBody.innerHTML = ''; // Clear existing table rows
        const budgetsCollection = collection(db, "users", currentUserId, "budgets");
        const q = query(budgetsCollection, where("year", "==", currentYear) && orderBy("month", "desc"));
        const snapshot = await getDocs(q);
        let serialNo = 1;

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const row = budgetTableBody.insertRow();
          const month = data.month;
          const year = data.year;
          const budget = data.amount;

          // Calculate total expenses for this specific month and year
          let totalExpensesForMonth = 0;
          const transactionsCollection = collection(db, "users", currentUserId, "transactions");
          const transactionsSnapshot = await getDocs(transactionsCollection);
          transactionsSnapshot.forEach(transactionDoc => {
            const transactionData = transactionDoc.data();
            const transactionDate = transactionData.timestamp?.toDate();
            if (transactionDate && transactionDate.getMonth() + 1 === month && transactionDate.getFullYear() === year) {
              totalExpensesForMonth += parseFloat(transactionData.amount) || 0;
            }
          });

          const remaining = (budget - totalExpensesForMonth).toFixed(2);
          const formattedMonthYear = `${monthNames[month - 1]} / ${year}`;

          row.insertCell().textContent = serialNo++;
          row.insertCell().textContent = formattedMonthYear;
          row.insertCell().textContent = "Rs. " + budget.toFixed(2);
          row.insertCell().textContent = "Rs. " + totalExpensesForMonth.toFixed(2);
          row.insertCell().textContent = "Rs. " + remaining;
        }


      } catch (error) {
        console.log("LoadBudgetTable", error);

      }

    } else {
      console.log("Load Budget Failed")
    }
  })
}

loadBudget();
loadBudgetTable();

function clearMessage() {
  document.getElementById('budgetAmount').textContent = "";
  document.getElementById('budgetAmount').style.backgroundColor = "transparent";
  document.getElementById('showAddMessage').textContent = "";
  document.getElementById('showAddMessage').style.backgroundColor = "transparent";
}


document.addEventListener('click', function (event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' ) {
      clearMessage();
  }
});


