from django.test import TestCase
from django.contrib.auth.models import User
from recipes.models import Recipe

class RecipeModelTest(TestCase):
    def setUp(self):
        """Set up a test user and test a recipe."""
        self.user = User.objects.create(username="capstone_user", password="dbbytes_basil")
        self.recipe =Recipe.objects.create(
            user=self.user,
            recipe_name="Test recipe",
            description="Test description",
            instructions="Test instructions"
        )

    def test_recipe_create(self):
        """Test if recipe is created."""
        self.assertEqual(self.recipe.recipe_name, "Test recipe")
        self.assertEqual(self.recipe.user.username, "capstone_user")

    def test_recipe_string(self):
        """Test the returned string with the recipe name"""
        self.assertEqual(str(self.recipe), "Test recipe")
