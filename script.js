// === Initialize meals and ingredients ===
let meals = JSON.parse(localStorage.getItem('meals')) || [];
let haveIngredients = JSON.parse(localStorage.getItem('haveIngredients')) || [];

const mealList = document.getElementById('meal-list');
const haveList = document.getElementById('have-list');
const suggestedList = document.getElementById('suggested-list');
const shoppingListEl = document.getElementById('shopping-list');

// === Helper functions ===
function saveMeals() {
  localStorage.setItem('meals', JSON.stringify(meals));
}

function saveHaveIngredients() {
  localStorage.setItem('haveIngredients', JSON.stringify(haveIngredients));
}

function renderMeals() {
  mealList.innerHTML = '';
  meals.forEach((meal, index) => {
    const li = document.createElement('li');
    li.textContent = meal.name;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editMeal(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteMeal(index);

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    mealList.appendChild(li);
  });
}

function renderHaveIngredients() {
  haveList.innerHTML = '';
  haveIngredients.forEach((ingredient, index) => {
    const li = document.createElement('li');
    li.textContent = ingredient;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      haveIngredients.splice(index, 1);
      saveHaveIngredients();
      renderHaveIngredients();
    };

    li.appendChild(deleteBtn);
    haveList.appendChild(li);
  });
}

// === Edit/Delete Meal ===
function editMeal(index) {
  const newName = prompt('Enter new meal name:', meals[index].name);
  if (!newName) return;

  const newIngredients = prompt('Enter ingredients (comma-separated):', meals[index].ingredients.join(','));
  if (!newIngredients) return;

  meals[index] = { name: newName, ingredients: newIngredients.split(',').map(i => i.trim()) };
  saveMeals();
  renderMeals();
}

function deleteMeal(index) {
  meals.splice(index, 1);
  saveMeals();
  renderMeals();
}

// === Add Meal ===
document.getElementById('meal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('meal-name').value.trim();
  const ingredients = document.getElementById('ingredients').value.trim().split(',').map(i => i.trim());

  if (name && ingredients.length) {
    meals.push({ name, ingredients });
    saveMeals();
    renderMeals();

    document.getElementById('meal-name').value = '';
    document.getElementById('ingredients').value = '';
  }
});

// === Add Ingredients You Have ===
document.getElementById('have-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const ingredient = document.getElementById('have-input').value.trim();
  if (ingredient && !haveIngredients.includes(ingredient)) {
    haveIngredients.push(ingredient);
    saveHaveIngredients();
    renderHaveIngredients();
  }
  document.getElementById('have-input').value = '';
});

// === Suggest 7 Meals ===
function suggestMeals() {
  suggestedList.innerHTML = '';
  if (meals.length === 0) return [];

  const shuffled = [...meals].sort(() => 0.5 - Math.random());
  const weekMeals = [];

  for (let meal of shuffled) {
    if (weekMeals.length >= 7) break;
    if (!weekMeals.includes(meal)) weekMeals.push(meal);
  }

  weekMeals.forEach(meal => {
    const li = document.createElement('li');
    li.textContent = meal.name + ': ' + meal.ingredients.join(', ');
    suggestedList.appendChild(li);
  });

  return weekMeals;
}

// === Regenerate Button ===
document.getElementById('regenerate-btn').addEventListener('click', suggestMeals);

// === Generate Shopping List ===
document.getElementById('generate-shopping-list-btn').addEventListener('click', () => {
  const weekMeals = suggestMeals();
  const allIngredients = new Set();

  weekMeals.forEach(meal => {
    meal.ingredients.forEach(i => allIngredients.add(i));
  });

  // Remove ingredients user already has
  haveIngredients.forEach(i => allIngredients.delete(i));

  shoppingListEl.innerHTML = '';
  allIngredients.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    shoppingListEl.appendChild(li);
  });
});

// === Initial render ===
renderMeals();
renderHaveIngredients();
