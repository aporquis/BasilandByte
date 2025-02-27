from django.test import TestCase
from django.contrib.auth.models import User
from recipes.models import Recipe, Ingredient, RecipeIngredient, FoodGroup

class RecipeIngredientModels(TestCase):
    def setUp(self):
        """FULL MODEL TEST: Set up a test user, recipe, recipe ingredient, ingredient, and food group"""
        self.user = User.objects.create(username="capstone_user", password="dbbytes_basil")
        self.food_group = FoodGroup.objects.create(food_group_name="Vegetables")
        self.ingredient = Ingredient.objects.create(
            ingredient_name="Tomato",
            food_group=self.food_group,
            specific_species="Roma"
        )

        self.recipe =Recipe.objects.create(
            user=self.user,
            recipe_name="Tomato Salad",
            description="A refreshing mix of tomatoes and basil",
            instructions="Cut roma tomatoes into large quarters. Add leaves of basil. Drizzle with olive oil and balsamic vinegar."
        )

        self.recipe_ingredient = RecipeIngredient.objects.create(
            recipe=self.recipe,
            ingredient=self.ingredient,
            quantity=2,
            unit="pieces"
        )

    def test_recipe_ingredient_create(self):
        self.assertEqual(self.recipe_ingredient.recipe.recipe_name, "Tomato Salad")
        self.assertEqual(self.recipe_ingredient.ingredient.ingredient_name, "Tomato")
        self.assertEqual(self.recipe_ingredient.quantity, 2)
        self.assertEqual(self.recipe_ingredient.unit, "pieces")

    def test_recipe_ingredient_string(self):
        expect_str = "Tomato Salad - Tomato"
        self.assertEqual(str(self.recipe_ingredient), expect_str)
