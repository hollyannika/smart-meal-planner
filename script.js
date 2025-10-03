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

    // Load meals from local storage or initialize an empty array if none exist.
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    let pantryIngredients = [];
    let currentWeeklyPlan = [];

    // Helper function to render the list of added meals.
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

    // Handle form submission for adding a new meal.
    addMealForm.addEventListener('submit', (e) => {
        // Prevent the form from reloading the page, which would erase our data.
        e.preventDefault(); 
        const mealName = document.getElementById('meal-name').value.trim();
        const mealIngredients = document.getElementById('meal-ingredients').value.trim().split(',').map(i => i.trim().toLowerCase());

        if (mealName && mealIngredients.length > 0) {
            meals.push({ name: mealName, ingredients: mealIngredients });
            // Save the updated meals list to local storage.
            localStorage.setItem('meals', JSON.stringify(meals)); 
            addMealForm.reset();
            renderMeals();
        }
    });

    // Handle editing and deleting meals.
    mealListContainer.addEventListener('click', (e) => {
        const target = e.target;
        // Use event delegation to handle clicks on the buttons inside meal-items.
        if (target.classList.contains('delete-meal-btn')) {
            const index = target.dataset.index;
            meals.splice(index, 1);
            localStorage.setItem('meals', JSON.stringify(meals));
            renderMeals();
        } else if (target.classList.contains('edit-meal-btn')) {
            const index = target.dataset.index;
            const mealToEdit = meals[index];
            document.getElementById('meal-name').value = mealToEdit.name;
            document.getElementById('meal-ingredients').value = mealToEdit.ingredients.join(', ');
            // Remove the meal so the user can re-add it with new data.
            meals.splice(index, 1);
            localStorage.setItem('meals', JSON.stringify(meals));
            renderMeals();
        }
    });

    // Handle form submission for adding pantry ingredients and generating a plan.
    pantryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pantryInput = document.getElementById('pantry-ingredients').value.trim();
        pantryIngredients = pantryInput.split(',').map(i => i.trim().toLowerCase());
        generateWeeklyPlan();
        pantrySection.style.display = 'none';
        weeklyPlanSection.style.display = 'block';
    });

    // Generate the weekly meal plan.
    function generateWeeklyPlan() {
        if (meals.length === 0) {
            weeklyMealsContainer.innerHTML = '<p>Please add some meals first!</p>';
            return;
        }
        
        // Prioritize meals that use at least one pantry ingredient.
        const matchingMeals = meals.filter(meal =>
            meal.ingredients.some(ingredient => pantryIngredients.includes(ingredient))
        );

        // Fall back to all meals if no matches are found.
        const potentialMeals = matchingMeals.length > 0 ? matchingMeals : meals;
        
        currentWeeklyPlan = [];
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const usedMealIndices = new Set();
        let safetyCounter = 0;

        while (currentWeeklyPlan.length < 7 && safetyCounter < potentialMeals.length * 2) {
            const randomIndex = Math.floor(Math.random() * potentialMeals.length);
            // Ensure unique meals are suggested for each day.
            if (!usedMealIndices.has(randomIndex)) {
                currentWeeklyPlan.push(potentialMeals[randomIndex]);
                usedMealIndices.add(randomIndex);
            }
            safetyCounter++;
        }
        
        renderWeeklyPlan(daysOfWeek);
    }

    // Display the weekly meal plan.
    function renderWeeklyPlan(daysOfWeek) {
        weeklyMealsContainer.innerHTML = '';
        if (currentWeeklyPlan.length === 0) {
             weeklyMealsContainer.innerHTML = '<p>Could not generate a weekly plan. Please add more unique meals.</p>';
             return;
        }

        currentWeeklyPlan.forEach((meal, index) => {
            const mealDay = document.createElement('div');
            mealDay.classList.add('weekly-meal-day');
            mealDay.innerHTML = `<strong>${daysOfWeek[index]}:</strong> ${meal.name}`;
            weeklyMealsContainer.appendChild(mealDay);
        });
    }

    // Regenerate button functionality.
    regenerateButton.addEventListener('click', generateWeeklyPlan);

    // Generate shopping list.
    generateListButton.addEventListener('click', () => {
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

    // Initial render when the page loads.
    renderMeals();
});
