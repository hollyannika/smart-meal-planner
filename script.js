// A class to represent a Meal, storing its name, URL, and ingredients.
class Meal {
    constructor(url, ingredients) {
        this.url = url;
        this.ingredients = ingredients.split(',').map(item => item.trim());
        // Attempt to extract meal name from URL, or use a placeholder
        this.name = this.extractMealName(url) || 'Meal Idea';
    }

    extractMealName(url) {
        try {
            const urlObj = new URL(url);
            // Example for BBC Good Food
            if (urlObj.hostname.includes('bbcgoodfood.com')) {
                const parts = urlObj.pathname.split('/');
                return parts[parts.length - 2]?.replace(/-/g, ' ');
            }
            // Add more specific logic for other sites here
            return null;
        } catch (e) {
            return null;
        }
    }
}

// Main application logic
const App = {
    meals: [],
    pantry: [],
    
    init() {
        this.loadData();
        this.renderMealIdeas();
        this.renderPantry();
        this.addEventListeners();
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
        document.getElementById('add-meal-form').addEventListener('submit', this.handleAddMeal.bind(this));
        document.getElementById('add-pantry-form').addEventListener('submit', this.handleAddPantry.bind(this));
        document.getElementById('generate-plan-btn').addEventListener('click', this.generateWeeklyPlan.bind(this));
    },

    handleAddMeal(event) {
        event.preventDefault();
        const mealUrl = document.getElementById('meal-url').value;
        const mealIngredients = document.getElementById('meal-ingredients').value;
        const newMeal = new Meal(mealUrl, mealIngredients);
        this.meals.push(newMeal);
        this.saveData();
        this.renderMealIdeas();
        event.target.reset();
    },

    handleAddPantry(event) {
        event.preventDefault();
        const pantryItemsText = document.getElementById('pantry-items').value;
        this.pantry = pantryItemsText.split(',').map(item => item.trim().toLowerCase());
        this.saveData();
        this.renderPantry();
    },

    renderMealIdeas() {
        const container = document.getElementById('meal-ideas-container');
        container.innerHTML = '';
        this.meals.forEach(meal => {
            const mealTile = document.createElement('div');
            mealTile.className = 'meal-tile';
            mealTile.innerHTML = `
                <h3>${meal.name}</h3>
                <a href="${meal.url}" target="_blank">View Recipe</a>
            `;
            container.appendChild(mealTile);
        });
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
            const matches = meal.ingredients.filter(ing => this.pantry.includes(ing.toLowerCase()));
            return { meal, score: matches.length };
        });

        // Sort by score (descending) and shuffle for randomness among equal scores
        mealScores.sort((a, b) => b.score - a.score || Math.random() - 0.5);

        const weeklyPlan = mealScores.slice(0, 7).map(item => item.meal);
        
        // Fallback for weeks with less than 7 meals
        if (this.meals.length < 7) {
            const availableMeals = this.meals.filter(meal => !weeklyPlan.includes(meal));
            while (weeklyPlan.length < 7 && availableMeals.length > 0) {
                const randomMeal = availableMeals.splice(Math.floor(Math.random() * availableMeals.length), 1)[0];
                weeklyPlan.push(randomMeal);
            }
        }
        
        this.renderWeeklyPlan(weeklyPlan);
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
                const matches = meal.ingredients.filter(ing => this.pantry.includes(ing.toLowerCase()));
                const nonMatches = meal.ingredients.filter(ing => !this.pantry.includes(ing.toLowerCase()));

                const ingredientsHtml = `
                    ${matches.length > 0 ? `<p class="ingredient-info">Using: <span class="ingredient-match">${matches.join(', ')}</span></p>` : ''}
                    ${nonMatches.length > 0 ? `<p class="ingredient-info">Need: ${nonMatches.join(', ')}</p>` : ''}
                `;

                mealTile.innerHTML = `
                    <div class="day-of-week">${day}</div>
                    <h3><a href="${meal.url}" target="_blank">${meal.name}</a></h3>
                    ${ingredientsHtml}
                `;
            } else {
                mealTile.innerHTML = `<div class="day-of-week">${day}</div><h3>No meal selected</h3>`;
            }
            container.appendChild(mealTile);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
