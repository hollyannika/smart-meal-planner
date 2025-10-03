// Arrays to store meals and fridge items
let meals = [];
let fridge = [];

// Get DOM elements
const mealNameInput = document.getElementById('mealName');
const mealIngredientsInput = document.getElementById('mealIngredients');
const mealList = document.getElementById('mealList');

const fridgeItemInput = document.getElementById('fridgeItem');
const fridgeList = document.getElementById('fridgeList');

const suggestBtn = document.getElementById('suggestBtn');
const suggestionsList = document.getElementById('suggestionsList');

// Add meal to meals array
document.getElementById('addMealBtn').addEventListener('click', () => {
    const name = mealNameInput.value.trim();
    const ingredients = mealIngredientsInput.value.split(',').map(i => i.trim().toLowerCase());
    if(name && ingredients.length > 0){
        meals.push({name, ingredients});
        updateMealList();
        mealNameInput.value = '';
        mealIngredientsInput.value = '';
    }
});

// Add fridge item to fridge array
document.getElementById('addFridgeBtn').addEventListener('click', () => {
    const item = fridgeItemInput.value.trim().toLowerCase();
    if(item){
        fridge.push(item);
        updateFridgeList();
        fridgeItemInput.value = '';
    }
});

// Update the meal list display
function updateMealList(){
    mealList.innerHTML = '';
    meals.forEach(meal => {
        const li = document.createElement('li');
        li.textContent = `${meal.name} - [${meal.ingredients.join(', ')}]`;
        mealList.appendChild(li);
    });
}

// Update the fridge list display
function updateFridgeList(){
    fridgeList.innerHTML = '';
    fridge.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        fridgeList.appendChild(li);
    });
}

// Suggest meals based on fridge contents
suggestBtn.addEventListener('click', () => {
    suggestionsList.innerHTML = '';
    // Filter meals that share at least one ingredient with the fridge
    const suggestions = meals.filter(meal => meal.ingredients.some(i => fridge.includes(i)));
    suggestions.forEach(meal => {
        const li = document.createElement('li');
        li.textContent = meal.name;
        suggestionsList.appendChild(li);
    });
});
