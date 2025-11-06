const searchForm = document.getElementById('searchForm');
const searchQuery = document.getElementById('searchQuery');
const resultsDiv = document.getElementById('results');

const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

document.addEventListener('DOMContentLoaded', () => {
    loadRandomCocktails();
});

async function loadRandomCocktails() {
    showLoading();

    try {
        const randomPromises = [];
        for (let i = 0; i < 9; i++) {
            randomPromises.push(fetch(`${API_BASE}/random.php`));
        }

        const responses = await Promise.all(randomPromises);
        const dataPromises = responses.map(res => res.json());
        const dataArray = await Promise.all(dataPromises);

        const randomCocktails = dataArray.map(data => data.drinks[0]);
        displayCocktails(randomCocktails, 'Tragos Recomendados');

    } catch (error) {
        displayEmptyCocktails(1, 'Tragos Recomendados');
    }
}

async function searchCocktails() {
    const query = searchQuery.value.trim();

    if (!query) {
        displayEmptyCocktails(1, 'Resultados vacíos');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);

        if (!response.ok) throw new Error('Error en la conexión');

        const data = await response.json();

        if (data.drinks) {
            displayCocktails(data.drinks, `Resultados para: "${query}"`);
        } else {
            displayEmptyCocktails(1, `No se encontraron cocteles para "${query}"`);
        }

    } catch (error) {
        displayEmptyCocktails(1, 'Tragos Recomendados');
    }
}

function showLoading() {
    resultsDiv.innerHTML = '<div class="loading">Buscando cocteles...</div>';
}

// Función para mostrar placeholder
function displayEmptyCocktails(count = 1, title = 'Tragos Recomendados') {
    const emptyHTML = Array(count).fill(0).map(() => `
        <div class="cocktail-card empty">
            <div class="cocktail-image placeholder"></div>
            <div class="cocktail-info">
                <h3 class="cocktail-name">&nbsp;</h3>
                <p class="cocktail-category">&nbsp;</p>
                <p class="cocktail-instructions">&nbsp;</p>
                <h4>Ingredientes:</h4>
                <ul class="ingredients-list">
                    <li>&nbsp;</li>
                </ul>
            </div>
        </div>
    `).join('');

    resultsDiv.innerHTML = `
        <h2>${title}</h2>
        <div class="cocktails-grid">
            ${emptyHTML}
        </div>
    `;
}

function displayCocktails(cocktails, title = 'Tragos Recomendados') {
    const cocktailsHTML = cocktails.map(cocktail => `
        <div class="cocktail-card">
            <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" class="cocktail-image">
            <div class="cocktail-info">
                <h3 class="cocktail-name">${cocktail.strDrink}</h3>
                <p class="cocktail-category">${cocktail.strCategory} - ${cocktail.strAlcoholic}</p>
                <p class="cocktail-instructions">${cocktail.strInstructions || 'Sin instrucciones'}</p>
                <h4>Ingredientes:</h4>
                <ul class="ingredients-list">
                    ${getIngredientsList(cocktail)}
                </ul>
            </div>
        </div>
    `).join('');

    resultsDiv.innerHTML = `
        <h2>${title}</h2>
        <div class="cocktails-grid">
            ${cocktailsHTML}
        </div>
    `;
}

function getIngredientsList(cocktail) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`];
        const measure = cocktail[`strMeasure${i}`];

        if (ingredient) {
            ingredients.push(`<li>${measure || ''} ${ingredient}</li>`);
        }
    }
    return ingredients.join('');
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchCocktails();
});

// Registrar Service Worker
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(err => console.error('Error registrando SW:', err));
    }
});
