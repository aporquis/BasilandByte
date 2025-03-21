from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# The models below create tables. Primary keys are specified and foreign keys are referenced
# We do not need to create a user model, as we are using Django's user model


# The models below create tables. Primary keys are specified and foreign keys are referenced
# We do not need to create a user model, as we are using Django's user model



class Recipe(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="recipes")
    recipe_name = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(
        upload_to='recipe_images/', null=True, blank=True)

    def __str__(self):
        return self.recipe_name


class Ingredient(models.Model):
    ingredient_name = models.CharField(max_length=100)
    food_group = models.ForeignKey(
        "FoodGroup", on_delete=models.SET_NULL, null=True, related_name="ingredients")
    specific_species = models.CharField(max_length=100, null=True, blank=True)
>>>>>>> origin/main
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='recipe_images/', null=True, blank =True)

    def __str__(self):
<<<<<<< HEAD
        """Returns a string that represents the recipe (the title)."""
        return self.recipe_name

class FoodGroup(models.Model):
    """This is a basic model for storing food groups"""
    food_group_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Returns a string that represents the food group."""
        return self.food_group_name

class Ingredient(models.Model):
    """This is a basic model for storing all ingredients"""
    ingredient_name = models.CharField(max_length=100)
    food_group = models.ForeignKey(FoodGroup, on_delete=models.SET_NULL, null=True, related_name= "ingredients")
    specific_species = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ingredient_name


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="recipe_ingredients")
    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.CASCADE, related_name="ingredient_recipes")
    quantity = models.DecimalField(max_digits=3, decimal_places=2)
    unit = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
<<<<<<< HEAD
        """Returns a f-string of the recipe name and the ingredient name"""
        return f"{self.recipe.recipe_name} - {self.ingredient.ingredient_name}"

class SavedItem(models.Model):
    """Stores saved recipes for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_recipes")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Returns a f-string of the username and the saved recipe name"""
        return f"{self.user.username} - {self.recipe.recipe_name}"
=======
        return f"{self.recipe.recipe_name} - {self.ingredient.ingredient_name}"


class FoodGroup(models.Model):
    food_group_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.food_group_name


class SavedItem(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="saved_recipes")
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.recipe.recipe_name}"


class WeeklyPlan(models.Model):
    """Stores weekly meal plans for users."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="weekly_plans")
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="planned_meals")
    day = models.CharField(max_length=10, choices=[
        ("Monday", "Monday"), ("Tuesday", "Tuesday"), ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"), ("Friday", "Friday"), ("Saturday", "Saturday"),
        ("Sunday", "Sunday")
    ])
    meal_type = models.CharField(max_length=10, choices=[
        ("Breakfast", "Breakfast"), ("Lunch", "Lunch"), ("Dinner", "Dinner")
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # One recipe per meal per day
        unique_together = ('user', 'day', 'meal_type')

    def __str__(self):
        return f"{self.user.username} - {self.day} {self.meal_type}: {self.recipe.recipe_name}"
    

class LoginEvent(models.Model):
    username = models.CharField(max_length=150)  # Username attempted
    timestamp = models.DateTimeField(
        default=timezone.now)  # When the attempt occurred
    outcome = models.CharField(max_length=10, choices=[(
        'success', 'Success'), ('failure', 'Failure')])  # Result
    source = models.CharField(max_length=10, choices=[(
        # Source of attempt
        'mobile', 'Mobile'), ('web', 'Web')], default='unknown')

    def __str__(self):
        return f"{self.username} - {self.timestamp} - {self.outcome} ({self.source})"

    class Meta:
        ordering = ['-timestamp']  # Latest events first
    
    
>>>>>>> origin/main
    