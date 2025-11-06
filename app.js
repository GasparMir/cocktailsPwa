const searchForm = document.getElementById('searchForm');
const searchQuery = document.getElementById('searchQuery');
const resultsDiv = document.getElementById('results');

const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker (sw.js) registrado correctamente'))
    .catch(err => console.error('Error al registrar el Service Worker:', err));
}

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
    const dataArray = await Promise.all(responses.map(res => res.json()));
    const randomCocktails = dataArray.map(data => data.drinks[0]);

    displayCocktails(randomCocktails, 'Tragos Recomendados');
  } catch (error) {
    console.error('Error al cargar tragos:', error);
    showError('Error al cargar tragos.');
  }
}

async function searchCocktails() {
  const query = searchQuery.value.trim();

  if (!query) {
    showError('Ingresa un nombre de coctel.');
    return;
  }

  showLoading();

  try {
    const url = `${API_BASE}/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error en la conexión');
    }

    const data = await response.json();

    if (data.drinks) {
      displayCocktails(data.drinks, `Resultados para: "${query}"`);
    } else {
      showNoResults();
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    showError('Error de conexión.');
  }
}

function showLoading() {
  resultsDiv.innerHTML = '<div class="loading">Buscando cocteles...</div>';
}

function showError(message) {
  resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

function showNoResults() {
  resultsDiv.innerHTML = '<div class="no-results">No se encontraron cocteles</div>';
}

function displayCocktails(cocktails, title = 'Tragos Recomendados') {
  const cocktailsHTML = cocktails.map(cocktail => `
    <div class="cocktail-card">
      <img src="${cocktail.strDrinkThumb}" 
           alt="${cocktail.strDrink}" 
           class="cocktail-image">
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

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  searchCocktails();
});
