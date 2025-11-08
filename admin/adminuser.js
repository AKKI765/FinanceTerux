import { db, auth } from "../js/firebase-config.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";


document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const close = document.querySelector('.close');
  const navMenu = document.querySelector('.nav-menu');
  const authMenu = document.querySelector('.auth-menu');

  hamburger.addEventListener('click', function() {
      navMenu.classList.add('active');
      authMenu.classList.add('active');
      hamburger.classList.add('active');
      close.classList.add('active');
  });

  close.addEventListener('click', function() {
      navMenu.classList.remove('active');
      authMenu.classList.remove('active');
      hamburger.classList.remove('active');
      close.classList.remove('active');
  });
});

const usersTableBody = document.querySelector("#usersTable tbody");
const totalUsersEl = document.getElementById("totalUsers");
const activeUsersEl = document.getElementById("activeUsers");
const searchInput = document.getElementById("searchInput");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumberEl = document.getElementById("pageNumber");





let usersList = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;

// Authenticate Admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Check if the user is an admin
    const adminDoc = await getDoc(doc(db, "admins", user.uid));  // Assuming admins are stored in "admins" collection
    if (adminDoc.exists()) {
     
      fetchUsers();
    } else {
      alert("Access Denied. You are not an admin.");
      await signOut(auth);
      window.location.href = "/login.html"; // Redirect to login page
    }
  } else {
    // No user is signed in
    window.location.href = "/login.html"; // Redirect to login page
  }
});

// Fetch Users
async function fetchUsers() {
  const users = collection(db, "users");
  const querySnapshot = await getDocs(users);
  usersList = [];
  let activeCount = 0;

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const userId = docSnap.id; // Document ID
    const email = data.email || "No Email";
    const isActive = data.active !== false; // Assume true if not explicitly false

    usersList.push({ id: userId, email: email, active: isActive });

    if (isActive) activeCount++;
  });

  totalUsersEl.textContent = usersList.length;
  activeUsersEl.textContent = activeCount;

  filteredUsers = usersList; // Initially show all users
  renderUsers(filteredUsers);
}

// Render Users for Current Page
function renderUsers(list) {
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentPageUsers = list.slice(startIndex, endIndex);

  usersTableBody.innerHTML = "";
  let serial = startIndex + 1;

  currentPageUsers.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${serial++}</td>
      <td>${user.email}</td>
      <td>${user.id}</td>
    `;
    usersTableBody.appendChild(row);
  });

  pageNumberEl.textContent = `Page ${currentPage}`;
}

// Search Users
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  filteredUsers = usersList.filter(user =>
    user.email.toLowerCase().includes(searchValue) || 
    user.id.toLowerCase().includes(searchValue)
  );
  currentPage = 1; // Reset to page 1 after search
  renderUsers(filteredUsers);
});

// Pagination
nextPageBtn.addEventListener("click", () => {
  if (currentPage * usersPerPage < filteredUsers.length) {
    currentPage++;
    renderUsers(filteredUsers);
  }
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderUsers(filteredUsers);
  }
});
