from django.test import TestCase
from recipes.models import Ingredient, FoodGroup

class IngredientModelTest(TestCase):
    def setUp(self):
        """Set up a test food group and ingredient"""
        self.food_group = FoodGroup.objects.create(food_group_name="Vegetables")
        self.ingredient = Ingredient.objects.create(
            ingredient_name="Tomato",
            food_group=self.food_group,
            specific_species="Roma"
        )

    def test_ingredient_create(self):
        """Test if ingredient is created."""
        self.assertEqual(self.ingredient.ingredient_name, "Tomato")
        self.assertEqual(self.ingredient.specific_species, "Roma")
        self.assertEqual(self.ingredient.food_group.food_group_name, "Vegetables")

    def test_ingredient_string(self):
        """Test the returned string with the ingredient name"""
        self.assertEqual(str(self.ingredient), "Tomato")
