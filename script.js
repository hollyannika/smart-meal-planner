document.addEventListener('DOMContentLoaded', () => {
    const mealListContainer = document.getElementById('meals-container');
    const addMealForm = document.getElementById('add-meal-form');
    const pantryForm = document.getElementById('pantry-form');
    const pantrySection = document.getElementById('pantry-section');
    const weeklyPlanSection = document.getElementById('weekly-plan-section');
    const weeklyMealsContainer = document.getElementById('weekly-meals-container');
    const regenerateButton = document.getElementById('regenerate-button');
    const generateListButton = document.getElementById('generate-list-button');
    const shoppingListSection = document.getElementById('shopping-list-section');
    const shoppingListContainer = document.getElementById('shopping-list-container');

    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    let pantryIngredients = [];
    let currentWeeklyPlan = [];

    // Helper function to render the list of added meals
    function renderMeals() {
        mealListContainer.innerHTML = '';
        if (meals.length === 0) {
            mealListContainer.innerHTML = '<p>No meals added yet.</p>';
            return;
        }

        meals.forEach((meal, index) => {
            const mealItem = document.createElement('div');
            mealItem.classList.add('meal-item');
            mealItem.innerHTML = `
                <span>${meal.name}</span>
                <div>
                    <button class="edit-meal-btn" data-index="${index}">Edit</button>
                    <button class="delete-meal-btn" data-index="${index}">Delete</button>
                </div>
            `;
            mealListContainer.appendChild(mealItem);
        });
    }

    // Function to handle adding a new meal
    addMealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mealName = document.getElementById('meal-name').value.trim();
        const mealIngredients = document.getElementById('meal-ingredients').value.trim().split(',').map(i => i.trim().toLowerCase());

        if (mealName && mealIngredients.length > 0) {
            meals.push({ name: mealName, ingredients: mealIngredients });
            localStorage.setItem('meals', JSON.stringify(meals));
            addMealForm.reset();
            renderMeals();
        }
    });

    // Function to handle editing and deleting meals
    mealListContainer.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.dataset.index;

        if (target.classList.contains('delete-meal-btn')) {
            meals.splice(index, 1);
            localStorage.setItem('meals', JSON.stringify(meals));
            renderMeals();
        } else if (target.classList.contains('edit-meal-btn')) {
            // A simple edit implementation: pre-fill form
            const mealToEdit = meals[index];
            document.getElementById('meal-name').value = mealToEdit.name;
            document.getElementById('meal-ingredients').value = mealToEdit.ingredients.join(', ');
            // Remove the meal from the array so it can be re-added on form submission
            meals.splice(index, 1);
            localStorage.setItem('meals', JSON.stringify(meals));
            renderMeals();
        }
    });

    // Function to generate the weekly meal plan
    pantryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pantryInput = document.getElementById('pantry-ingredients').value.trim();
        pantryIngredients = pantryInput.split(',').map(i => i.trim().toLowerCase());
        generateWeeklyPlan();
        pantrySection.style.display = 'none';
        weeklyPlanSection.style.display = 'block';
    });
    
    // Core logic for generating the meal plan
    function generateWeeklyPlan() {
        const matchingMeals = meals.filter(meal =>
            meal.ingredients.some(ingredient => pantryIngredients.includes(ingredient))
        );

        // Prioritize meals that use pantry ingredients, but don't require them
        // This is a simple logic. For more complex matching, you'd need a more advanced algorithm.
        const potentialMeals = matchingMeals.length > 0 ? matchingMeals : meals;
        
        currentWeeklyPlan = [];
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const usedMealIndices = new Set();
        let safetyCounter = 0;

        for (let i = 0; i < 7; i++) {
            if (potentialMeals.length === 0) break;

            let randomIndex;
            let meal;
            do {
                randomIndex = Math.floor(Math.random() * potentialMeals.length);
                meal = potentialMeals[randomIndex];
                safetyCounter++;
                if (safetyCounter > potentialMeals.length * 2) {
                    // Prevent infinite loops if fewer than 7 unique meals are available
                    meal = potentialMeals[Math.floor(Math.random() * potentialMeals.length)];
                    break;
                }
            } while (usedMealIndices.has(randomIndex));
            
            usedMealIndices.add(randomIndex);
            currentWeeklyPlan.push(meal);
        }
        
        renderWeeklyPlan(daysOfWeek);
    }

    // Function to display the weekly meal plan
    function renderWeeklyPlan(daysOfWeek) {
        weeklyMealsContainer.innerHTML = '';
        currentWeeklyPlan.forEach((meal, index) => {
            const mealDay = document.createElement('div');
            mealDay.classList.add('weekly-meal-day');
            mealDay.innerHTML = `<strong>${daysOfWeek[index]}:</strong> ${meal.name}`;
            weeklyMealsContainer.appendChild(mealDay);
        });
    }

    // Regenerate button functionality
    regenerateButton.addEventListener('click', generateWeeklyPlan);

    // Generate shopping list
    generateListButton.addEventListener('click', () => {
        const shoppingList = new Set();
        const haveIngredients = new Set(pantryIngredients);
        const needIngredients = new Set();

        currentWeeklyPlan.forEach(meal => {
            meal.ingredients.forEach(ingredient => {
                if (!haveIngredients.has(ingredient)) {
                    needIngredients.add(ingredient);
                }
            });
        });

        shoppingListSection.style.display = 'block';
        shoppingListContainer.innerHTML = `
            <div class="shopping-list">
                <p class="list-header">What you need:</p>
                <ul>
                    ${Array.from(needIngredients).map(item => `<li>${item}</li>`).join('')}
                </ul>
                <p class="list-header">What you already have:</p>
                <ul>
                    ${Array.from(haveIngredients).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    // Initial render
    renderMeals();
});
