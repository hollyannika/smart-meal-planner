// A class to represent a Meal, storing its name and ingredients.
class Meal {
    constructor(name, ingredients) {
        this.name = name;
        this.ingredients = ingredients.split(',').map(item => item.trim().toLowerCase());
    }
}

// Main application logic
const App = {
    meals: [],
    pantry: [],
    weeklyPlan: [],

    init() {
        this.loadData();
        this.addEventListeners();
        this.renderMealIdeas();
        this.renderPantry();
    },

    loadData() {
        this.meals = JSON.parse(localStorage.getItem('meals')) || [];
        this.pantry = JSON.parse(localStorage.getItem('pantry')) || [];
    },

    saveData() {
        localStorage.setItem('meals', JSON.stringify(this.meals));
        localStorage.setItem('pantry', JSON.stringify(this.pantry));
    },

    addEventListeners() {
        // App listeners
        document.getElementById('add-meal-form').addEventListener('submit', this.handleAddMeal.bind(this));
        document.getElementById('add-pantry-form').addEventListener('submit', this.handleAddPantry.bind(this));
        document.getElementById('clear-pantry-btn').addEventListener('click', this.handleClearPantry.bind(this));
        document.getElementById('generate-plan-btn').addEventListener('click', this.generateWeeklyPlan.bind(this));
        document.getElementById('regenerate-plan-btn').addEventListener('click', this.generateWeeklyPlan.bind(this));
        document.getElementById('generate-shopping-list-btn').addEventListener('click', this.generateShoppingList.bind(this));
    },

    handleAddMeal(event) {
        event.preventDefault();
        const mealName = document.getElementById('meal-name').value;
        const mealIngredients = document.getElementById('meal-ingredients').value;
        const newMeal = new Meal(mealName, mealIngredients);
        this.meals.push(newMeal);
        this.saveData();
        this.renderMealIdeas();
        event.target.reset();
    },

    handleClearPantry() {
        if (confirm('Are you sure you want to clear your pantry list?')) {
            this.pantry = [];
            document.getElementById('pantry-items').value = '';
            this.saveData();
            this.renderPantry();
        }
    },

    renderMealIdeas() {
        const container = document.getElementById('meal-ideas-container');
        container.innerHTML = '';
        this.meals.forEach((meal, index) => {
            const mealTile = document.createElement('div');
            mealTile.className = 'meal-tile';
            mealTile.innerHTML = `
                <h3>${meal.name}</h3>
                <button class="remove-meal-btn" data-index="${index}">Remove</button>
            `;
            container.appendChild(mealTile);
        });
        document.querySelectorAll('.remove-meal-btn').forEach(button => {
            button.addEventListener('click', this.handleRemoveMeal.bind(this));
        });
    },

    handleRemoveMeal(event) {
        const index = event.target.dataset.index;
        this.meals.splice(index, 1);
        this.saveData();
        this.renderMealIdeas();
    },

    handleAddPantry(event) {
        event.preventDefault();
        const pantryItemsText = document.getElementById('pantry-items').value;
        this.pantry = pantryItemsText.split(',').map(item => item.trim().toLowerCase());
        this.saveData();
        this.renderPantry();
    },

    renderPantry() {
        const container = document.getElementById('pantry-display');
        container.innerHTML = '';
        if (this.pantry.length > 0) {
            this.pantry.forEach(item => {
                const pantryItem = document.createElement('span');
                pantryItem.className = 'pantry-item';
                pantryItem.textContent = item;
                container.appendChild(pantryItem);
            });
        } else {
            container.textContent = 'Your pantry is empty.';
        }
    },

    generateWeeklyPlan() {
        const mealsToPlan = [...this.meals];
        
        // Prioritize meals based on pantry matches
        const mealScores = mealsToPlan.map(meal => {
            const matches = meal.ingredients.filter(ing => this.pantry.includes(ing));
            return { meal, score: matches.length };
        });

        // Sort by score (descending) and shuffle for randomness among equal scores
        mealScores.sort((a, b) => b.score - a.score || Math.random() - 0.5);

        this.weeklyPlan = mealScores.slice(0, 7).map(item => item.meal);
        
        // Fallback for weeks with less than 7 meals
        const remainingMeals = mealsToPlan.filter(meal => !this.weeklyPlan.includes(meal));
        while (this.weeklyPlan.length < 7 && remainingMeals.length > 0) {
            const randomMeal = remainingMeals.splice(Math.floor(Math.random() * remainingMeals.length), 1);
            if (randomMeal) {
                this.weeklyPlan.push(randomMeal);
            }
        }
        
        this.renderWeeklyPlan(this.weeklyPlan);
        document.getElementById('generate-plan-btn').style.display = 'none';
        document.getElementById('regenerate-plan-btn').style.display = 'inline-block';
        document.getElementById('generate-shopping-list-btn').style.display = 'inline-block';
    },

    renderWeeklyPlan(plan) {
        const container = document.getElementById('weekly-plan-container');
        container.innerHTML = '';
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach((day, index) => {
            const meal = plan[index];
            const mealTile = document.createElement('div');
            mealTile.className = 'meal-tile';
            
            if (meal) {
                const matches = meal.ingredients.filter(ing => this.pantry.includes(ing));
                const nonMatches = meal.ingredients.filter(ing => !this.pantry.includes(ing));

                const ingredientsHtml = `
                    ${matches.length > 0 ? `<p class="ingredient-info">Using: <span class="ingredient-match">${matches.join(', ')}</span></p>` : ''}
                    ${nonMatches.length > 0 ? `<p class="ingredient-info">Need: ${nonMatches.join(', ')}</p>` : ''}
                `;

                mealTile.innerHTML = `
                    <div class="day-of-week">${day}</div>
                    <h3>${meal.name}</h3>
                    ${ingredientsHtml}
                `;
            } else {
                mealTile.innerHTML = `<div class="day-of-week">${day}</div><h3>No meal selected</h3>`;
            }
            container.appendChild(mealTile);
        });
        document.getElementById('shopping-list-section').style.display = 'none';
    },
    
    generateShoppingList() {
        const allNeededIngredients = [];
        this.weeklyPlan.forEach(meal => {
            if (meal) {
                const needed = meal.ingredients.filter(ing => !this.pantry.includes(ing));
                allNeededIngredients.push(...needed);
            }
        });
        
        // Remove duplicates using a Set
        const uniqueIngredients = [...new Set(allNeededIngredients)];

        const container = document.getElementById('shopping-list-container');
        container.innerHTML = '';
        if (uniqueIngredients.length > 0) {
            uniqueIngredients.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                container.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No ingredients needed this week!';
            container.appendChild(li);
        }
        
        document.getElementById('shopping-list-section').style.display = 'block';
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
