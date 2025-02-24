from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
import json
from .models import Recipe
from .serializers import RecipeSerializer  # Import the serializer
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status

# Fetch all recipes (GET)


@api_view(["GET"])
def get_recipes(request):
    """Fetch all recipes, including their images."""
    recipes = Recipe.objects.all()
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)

#  Add a recipe (POST) with optional image


@api_view(["POST"])
@parser_classes([MultiPartParser])  # Enables file parsing
def add_recipe(request):
    """Handles adding a new recipe with an image."""
    try:
        data = request.data  # Parse form data (including file)
        serializer = RecipeSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Update an existing recipe (PUT) with image support


@api_view(["PUT"])
@parser_classes([MultiPartParser])
def update_recipe(request, recipe_id):
    """Updates a recipe's text and/or image."""
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id)

    serializer = RecipeSerializer(recipe, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#  Delete a recipe (DELETE)


@api_view(["DELETE"])
def delete_recipe(request, recipe_id):
    """Deletes a recipe by ID."""
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id)

    # If the recipe has an image, delete it from storage
    if recipe.image:
        default_storage.delete(recipe.image.path)

    recipe.delete()
    return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
