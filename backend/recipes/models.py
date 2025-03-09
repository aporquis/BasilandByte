from django.db import models
from django.contrib.auth.models import User

# The models below create tables. Primary keys are specified and foreign keys are referenced
# We do not need to create a user model, as we are using Django's user model

# The models below create tables. Primary keys are specified and foreign keys are referenced
# We do not need to create a user model, as we are using Django's user model

class Recipe(models.Model):
    """Stores recipes with recipe_id as the PK and user_id as a FK.
    Also holds recipe name, image, description, instructions, and a created at timestamp"""
    user =models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    recipe_name = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='recipe_images/', null=True, blank =True)

    def __str__(self):
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
        """Returns a string that represents the ingredient name."""
        return self.ingredient_name

class RecipeIngredient(models.Model):
    """This is a basic model for storing recipe ingredients; it will have a many to many relationship with other tables"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="recipe_ingredients")
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="ingredient_recipes")
    quantity = models.DecimalField(max_digits=3, decimal_places=2)
    unit = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
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
    