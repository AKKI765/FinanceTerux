import { db, auth } from "../js/firebase-config.js";
import { addDoc, collection, getDocs, deleteDoc, updateDoc, doc,query,where , orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const transactionForm = document.getElementById('transaction-form');
const typeDropdown = document.getElementById('type-dropdown');

const cardsCollection = collection(db, "cards");
const message = document.querySelector('.transactionMessage');
const messageAdd = document.querySelector('.transactionAddMessage');

const editModal = document.getElementById('editModal');
const modalOverlay = document.getElementById('modalOverlay');
const editTransactionForm = document.getElementById('editTransactionForm');
const editAmount = document.getElementById('editAmount');
const editDescription = document.getElementById('editDescription');
const editTransactionId = document.getElementById('editTransactionId');
const cancelEdit = document.getElementById('cancelEdit');

let currentUserId = null;

// Listen for auth state change
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        
        loadTransactions(); // Load transactions when user logs in
    } else {
        
        currentUserId = null;
    }
});



clearMessage();

async function fetchCards() {
    const snapshot = await getDocs(cardsCollection);
    snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = JSON.stringify({ cardTitle: data.cardTitle, imgUrl: data.imgUrl });
        option.textContent = data.cardTitle;
        
    });

    const selectedCardData = JSON.parse(localStorage.getItem('selectedCard'));
    if (selectedCardData) {
        [...typeDropdown.options].forEach(option => {
            const data = JSON.parse(option.value);
            if (data.cardTitle === selectedCardData.title) {
                option.selected = true;
            }
        });
    }
}

function clearMessage() {
    message.textContent = "";
    message.style.backgroundColor = "transparent";
    message.style.color = "black";
    message.style.padding = "0";
    message.style.borderRadius = "0";
    message.style.textAlign = "center";
    message.style.fontWeight = "normal";

    messageAdd.textContent = "";
    messageAdd.style.backgroundColor = "transparent";
    messageAdd.style.color = "black";
    messageAdd.style.padding = "0";
    messageAdd.style.borderRadius = "0";
    messageAdd.style.textAlign = "center";
    messageAdd.style.fontWeight = "normal";
}

function showMessage(text) {
    message.textContent = text;
    message.style.backgroundColor = "#d4edda";
    message.style.color = "#155724";
    message.style.padding = "10px";
    message.style.borderRadius = "8px";
    message.style.marginTop = "10px";
    message.style.textAlign = "center";
    message.style.fontWeight = "bold";
    message.style.transition = "all 0.5s ease";
}


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

fetchCards();

typeDropdown.addEventListener('change', () => {
    clearMessage();
});

// Handle form submit
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedData = JSON.parse(typeDropdown.value);
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');

    const amount = amountInput.value;
    const description = descriptionInput.value;

    if (!currentUserId) {
        showAddMessage("❌ You must be logged in to add a transaction.");
        return;
    }

    try {
        // Set path to users/{userId}/transactions
        const transactionsCollection = collection(db, "users", currentUserId, "transactions");

        await addDoc(transactionsCollection, {
            type: selectedData.cardTitle,
            imgUrl: selectedData.imgUrl,
            amount: Number(amount),
            description: description,
            timestamp: new Date()
        });

        showAddMessage("✅ Transactions Added Successfully!");
        loadTransactions(); // Reload transactions

        amountInput.value = "";
        descriptionInput.value = "";

    } catch (error) {
       
        showAddMessage('❌ Failed to add Transactions.');
    }
});

/////// Edit

function openEditModal(data) {
    editTransactionId.value = data.id;
    editAmount.value = data.amount;
    editDescription.value = data.description;

    editModal.style.display = 'block';
    modalOverlay.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

editTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editTransactionId.value;
    const updatedAmount = editAmount.value;
    const updatedDescription = editDescription.value;

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const currentUserId = user.uid;
            try {
                const transactionRef = doc(db, "users", currentUserId, "transactions", id);
                await updateDoc(transactionRef, {
                    amount: parseFloat(updatedAmount),
                    description: updatedDescription
                });
                closeEditModal();
                loadTransactions();
                showMessage("✅ Transaction Updated Successfully!");
            } catch (error) {
               
                showMessage("❌ Failed to update transaction.");
            }
        } else {
            showMessage("❌ You must be logged in to edit transactions.");
        }
    });
});

cancelEdit.addEventListener('click', () => {
    closeEditModal();
});

/// Delete

let transactionIdToDelete = null;

const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

confirmDeleteBtn.addEventListener('click', async () => {
    if (transactionIdToDelete) {
        await deleteTransaction(transactionIdToDelete);
        transactionIdToDelete = null;
        deleteModal.style.display = 'none';
    }
});

cancelDeleteBtn.addEventListener('click', () => {
    transactionIdToDelete = null;
    deleteModal.style.display = 'none';
});

async function deleteTransaction(id) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const currentUserId = user.uid;
            try {
                await deleteDoc(doc(db, "users", currentUserId, "transactions", id));
                loadTransactions();
                showMessage('✅ Transaction Deleted Successfully!');
            } catch (error) {
               
                showMessage('❌ Failed to delete transaction.');
            }
        } else {
            showMessage("❌ You must be logged in to delete transactions.");
        }
    });
}

///////// Time  /////////////

const todayExp = document.querySelector('.todayExpenses');
todayExp.innerHTML = '';

const todayHead = document.createElement('h2');
todayHead.classList.add('todayHead');

setInterval(() => {
    const date = new Date();
    const localDate = date.toDateString();

    todayHead.innerText = `Today's Transactions: ${localDate}`;
    todayExp.appendChild(todayHead);
}, 1000);

///////// Transaction Table /////////////

async function loadTransactions() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const currentUserId = user.uid;
            

            try {
                const transactionsCollection = collection(db, "users", currentUserId, "transactions");
                const snapshot = await getDocs(transactionsCollection);
                const tableBody = document.querySelector('#transaction-table tbody');
                tableBody.innerHTML = "";

                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);


                const transactions = [];
                snapshot.forEach(doc => {
                    transactions.push({ id: doc.id, ...doc.data() });
                });

                transactions.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

                let serialNumber = 1;
                transactions.forEach(data => {
                    if (data.timestamp) {
                        const transactionDate = data.timestamp.toDate();

                        // Use Firestore Timestamp comparison
                        if (transactionDate >= startOfDay && transactionDate < endOfDay) {
                            const tr = document.createElement('tr');

                            tr.innerHTML = `
                                <td>${serialNumber++}</td>
                                <td>${data.type}</td>
                                <td>Rs.${data.amount}</td>
                                <td>${transactionDate.toLocaleDateString()}</td>
                                <td>${data.description}</td>
                                <td>
                                    <button class="edit-btn" data-id="${data.id}">Edit</button>
                                    <button class="delete-btn" data-id="${data.id}">Delete</button>
                                </td>
                            `;

                            tr.querySelector('.edit-btn').addEventListener('click', () => {
                                openEditModal(data);
                            });

                            tr.querySelector('.delete-btn').addEventListener('click', () => {
                                transactionIdToDelete = data.id;
                                document.getElementById('deleteModal').style.display = 'block';
                            });

                            tableBody.appendChild(tr);
                        }
                    }
                });
            } catch (error) {
               
                showMessage("❌ Failed to load transactions.");
            }
        } else {
            
            showMessage("❌ You must be logged in to view transactions.");
        }
    });
}

loadTransactions();

fetchCards();

// Clear message when any input or button is clicked
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'TEXTAREA') {
        clearMessage();
    }
});