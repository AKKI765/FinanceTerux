import { db } from "../js/firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


const cardContainer = document.querySelector('.card-container');
const cardsCollection = collection(db, "cards");

// Real-time fetch
onSnapshot(cardsCollection, (snapshot) => {
    cardContainer.innerHTML = '';

    snapshot.forEach((doc) => {
        const data = doc.data();
        createCard(data.cardTitle, data.imgUrl);
    });
}, (error) => {
    console.error("Error fetching user cards:", error);
});

function createCard(cardTitle, imgUrl) {
    const card = document.createElement('div');
    card.classList.add('card');

    const image = document.createElement('img');
    image.src = imgUrl;
    image.alt = cardTitle;

    const titleElement = document.createElement('h3');
    titleElement.textContent = cardTitle;

    card.appendChild(image);
    card.appendChild(titleElement);
    cardContainer.appendChild(card);



    card.addEventListener('click', ()=>{
        localStorage.setItem('selectedCard', JSON.stringify({
            cardTitle: cardTitle,
            imgUrl: imgUrl
        }));

        window.location.href = '../pages/transactions.html';
    })
}
 