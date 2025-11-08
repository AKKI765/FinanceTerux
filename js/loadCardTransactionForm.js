import { db } from "../js/firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const selectedCardContainer = document.getElementById('selected-card');
const typeDropdown = document.getElementById('type-dropdown');
const cardsCollection = collection(db, "cards");

function updateSelectedCard(data) {
    selectedCardContainer.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = data.imgUrl;
    img.alt = data.cardTitle;

    const titleElement = document.createElement('h3');
    titleElement.textContent = data.cardTitle;

    card.appendChild(img);
    card.appendChild(titleElement);
    selectedCardContainer.appendChild(card);

    [...typeDropdown.options].forEach(option => {
        const optionData = JSON.parse(option.value);
        if (optionData.cardTitle === data.cardTitle) {
            option.selected = true;
        }
    });
}

async function fetchCards() {
    typeDropdown.innerHTML = ""; // Clear existing options

    const snapshot = await getDocs(cardsCollection);

    const selectedCardData = JSON.parse(localStorage.getItem('selectedCard'));

    let foundSelected = false;

    snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = JSON.stringify({ cardTitle: data.cardTitle, imgUrl: data.imgUrl });
        option.textContent = data.cardTitle;

        if (selectedCardData && selectedCardData.cardTitle === data.cardTitle) {
            option.selected = true;
            foundSelected = true;
        }

        typeDropdown.appendChild(option);
    });

    if (foundSelected) {
        updateSelectedCard(selectedCardData);
    } else if (typeDropdown.options.length > 0) {
        const selectedData = JSON.parse(typeDropdown.options[0].value);
        updateSelectedCard(selectedData);
    }
}

fetchCards();

typeDropdown.addEventListener('change', () => {
    const selectedData = JSON.parse(typeDropdown.value);
    updateSelectedCard(selectedData);
});

