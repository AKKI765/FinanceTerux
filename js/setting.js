import { auth, db } from '../js/firebase-config.js';
import {
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { deleteDoc, doc, collection, getDocs, writeBatch, query, limit } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// Elements
const userEmail = document.getElementById('userEmail');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteModal = document.getElementById('deleteModal');
const passwordInput = document.getElementById('passwordInput');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const inputMessage = document.getElementById('inputMessage'); // Get the inputMessage element
const forgotMessage = document.getElementById('forgotMessage'); // Get the forgotMessage element

// Show current user's email
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail.textContent = user.email;
    }
});

async function deleteCollection(collectionRef) {
    const querySnapshot = await getDocs(query(collectionRef, limit(500)));

    if (querySnapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    // Recursive call for the next batch
    await deleteCollection(collectionRef);
}

// Show delete modal
deleteAccountBtn.addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
});

// Cancel delete
cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
});

// Confirm delete
confirmDeleteBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    const password = passwordInput.value;
    

    if (!user || !password) {
        
        inputMessage.textContent = 'Please enter password !!!';
        inputMessage.style.color = 'red';
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
        await reauthenticateWithCredential(user, credential);
        const userId = user.uid;
        const userDocRef = doc(db, 'users', userId);

        // **Define all subcollections to be deleted**
        const subcollectionsToDelete = [
            collection(userDocRef, 'budgets'),
            collection(userDocRef, 'transactions'),
            
        ];

        inputMessage.textContent = 'Deleting user data... Please wait.';
        inputMessage.style.color = 'orange';

        // **Delete all subcollections**
        for (const subcollectionRef of subcollectionsToDelete) {
            await deleteCollection(subcollectionRef);
            
        }

        // **Delete the main user document**
        await deleteDoc(userDocRef);
        

        // **Delete the user's authentication**
        await deleteUser(user);
        forgotMessage.textContent = '✅ Account deleted successfully.';
        forgotMessage.style.color = 'green';
        forgotMessage.style.fontWeight = 'bolder';


        setTimeout(() => {
          window.location.href = '../index.html'; // Redirect to homepage
      }, 3000);

    } catch (error) {

        if (error.code === 'auth/invalid-credential') {
            inputMessage.textContent = 'Invalid Password.';
        } 
        else {
            inputMessage.textContent = 'An error occurred while deleting the account.';
        }
        inputMessage.style.color = 'red';
    } finally {
        // Optionally clear the password input
        passwordInput.value = '';
    }
});

// Forgot password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        try {
            await sendPasswordResetEmail(auth, user.email);
            forgotMessage.textContent = 'Password reset email sent!';
            forgotMessage.style.color = 'green';
            forgotMessage.style.fontWeight = 'bolder';
        } catch (error) {
            forgotMessage.textContent = 'Password reset email not sent!';
            forgotMessage.style.color = 'red';
            forgotMessage.style.fontWeight = 'bolder';
        } 
    }
});

function clearMessage() {
    inputMessage.textContent = '';
    forgotMessage.textContent = '';
}

document.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') {
        clearMessage();
    }
});