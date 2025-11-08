import { db } from "../js/firebase-config.js";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const cardContainer = document.querySelector('.card-container');
const cardsCollection = collection(db, "cards");
const message=document.querySelector('.message');
const message1=document.querySelector('.message1');
message.style.color="green";
message.style.fontWeight="bolder";
message1.style.color="red";
message1.style.fontWeight="bolder";



// Real-time listener
onSnapshot(cardsCollection, (snapshot) => {
    cardContainer.innerHTML = ''; // Clear old cards

    snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        createCard(docSnapshot.id, data.cardTitle, data.imgUrl);
    });
}, (error) => {
    console.error("Error listening to cards:", error);
});

// Create Card Element
let cardIdToDelete = null; // Store id temporarily

function createCard(id, cardTitle, imgUrl) {
    const card = document.createElement('div');
    card.classList.add('card');

    const image = document.createElement('img');
    image.src = imgUrl;
    image.alt = cardTitle;

    const titleElement = document.createElement('h3');
    titleElement.textContent = cardTitle;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = () => openDeleteModal(id); // open modal instead of delete directly

    card.appendChild(image);
    card.appendChild(titleElement);
    card.appendChild(deleteButton);
    cardContainer.appendChild(card);
}

// Open Modal
function openDeleteModal(id) {
    cardIdToDelete = id; // store id globally
    document.getElementById('deleteModal').style.display = 'flex';
}

// Confirm Deletion
document.getElementById('confirmDelete').onclick = async function () {
    if (cardIdToDelete) {
        try {
            await deleteDoc(doc(db, "cards", cardIdToDelete));
            message.style.display = "flex";
            message.innerHTML = `<p>✅ Card deleted successfully.</p>`;
        } catch (error) {
            message.style.display = "flex";
            message.innerHTML = `<p>❌ Card deletion failed</p>`;
            console.error("Error deleting card:", error);
        }
        cardIdToDelete = null; // reset after deleting
    }
    closeDeleteModal();
};

// Cancel Deletion
document.getElementById('cancelDelete').onclick = function () {
    cardIdToDelete = null; // reset if cancelled
    closeDeleteModal();
};

// Close Modal Function
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}



// Add Card
const addCardBtn = document.getElementById('addCardBtn');
const cardTitleInput = document.getElementById('cardTitleInput');
const imgUrlInput = document.getElementById('imgUrlInput');

addCardBtn.addEventListener('click', async () => {
    const title = cardTitleInput.value;
    const imgUrl = imgUrlInput.value;

    if (title === "" || imgUrl === "") {
        clearMessage1();
        message1.style.display="flex";
        message1.innerHTML=`<p>❌Please fill in both fields.</p>`;
        
        
        //alert("Please fill in both fields.");
        return;
    }

    try {
        await addDoc(cardsCollection, {
            cardTitle: title,
            imgUrl: imgUrl
        });

        // Clear inputs
        cardTitleInput.value = '';
        imgUrlInput.value = '';
        message.style.display="flex";
        message.innerHTML=`<p>✅Card added successfully.</p>`;

        //alert("Card added successfully!");
    } catch (error) {
        console.error("Error adding card:", error);
        message.style.display="flex";
        message.innerHTML=`<p>❌Failed to add card. Please try again.</p>`;
        //alert("Failed to add card. Please try again.");
    }
});


function clearMessage() {
    message.innerHTML = "";
    message.style.display="none";

}

function clearMessage1() {
    message1.innerHTML = "";
    message1.style.display="none";

}


// Clear message when any input or button is clicked
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' ) {
        clearMessage();
    }
});

document.addEventListener('click', function (event) {
    if (event.target.tagName === 'INPUT' ) {
        
        clearMessage1();
    }
});



