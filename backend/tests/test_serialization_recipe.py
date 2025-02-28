from django.test import TestCase
from django.contrib.auth.models import User
from recipes.models import Recipe
from recipes.serializers import RecipeSerializer
from rest_framework.test import APIRequestFactory

class RecipeSerializerTest(TestCase):
    def setUp(self):
        """Set up a test user and test recipe"""
        self.user = User.objects.create(username="capstone_user", password="dbbytes_basil")

        self.recipe = Recipe.objects.create(
            user = self.user,
            recipe_name = "Chocolate Cake",
            description = "Decadently rich chocolate cake",
            instructions = "Mix ingredients and bake for 45 min at 350F. Let cake cool, then frost and assemble."
        )

        self.factory = APIRequestFactory()

    def test_recipe_serialization(self):
        """Test if RecipeSerializer correctly serializes the recipe"""
        serializer = RecipeSerializer(self.recipe)
        data = serializer.data

        self.assertEqual(data["user"], self.user.username)
        self.assertEqual(data["recipe_name"], "Chocolate Cake")
        self.assertEqual(data["description"], "Decadently rich chocolate cake")
        self.assertEqual(data["instructions"], "Mix ingredients and bake for 45 min at 350F. Let cake cool, then frost and assemble.")

    def test_recipe_deserialization(self):
        """Test if RecipeSerializer correctly validates and creates a recipe"""
        request = self.factory.post("/recipes/")  #API POST request
        request.user = self.user

        data ={
            "recipe_name" : "Vanilla Cake", #use different recipe from above for more accurate validation!
            "description" : "Homemade vanilla cake with real vanilla bean",
            "instructions" : "Mix ingredients and make for 40 min at 350F. Let cake cool, then frost and assemble. Top with strawberries."
        }

        serializer =RecipeSerializer(data = data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

        recipe = serializer.save()

        self.assertEqual(recipe.user, self.user)
        self.assertEqual(recipe.recipe_name, "Vanilla Cake")
        self.assertEqual(recipe.description, "Homemade vanilla cake with real vanilla bean")
        self.assertEqual(recipe.instructions, "Mix ingredients and make for 40 min at 350F. Let cake cool, then frost and assemble. Top with strawberries.")

    def test_recipe_notComplete(self):
        """Test if recipe CANNOT be created without all fields completed"""
        request = self.factory.post("/recipes/")
        request.user = self.user

        data ={
            "recipe_name" : "Strawberry Cake" #do not fill in remaining fields; incomplete recipe
        }

        serializer =RecipeSerializer(data = data, context={"request": request})
        self.assertFalse(serializer.is_valid())  #we are expecting the validation to fail
        self.assertIn("description", serializer.errors)
        self.assertIn("instructions", serializer.errors)