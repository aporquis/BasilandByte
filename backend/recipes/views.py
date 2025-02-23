from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Recipe
from .serializers import RecipeSerializer

# Fetch all recipes (GET)

# Ensure that users are only able to delete and add recipes if they are logged in and the token is working. 

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_recipes(request):
    """Fetch all recipes, including their images."""
    recipes = Recipe.objects.all()
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)

# Add a recipe (POST) with optional image


@api_view(["POST"])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def add_recipe(request):
    """Handles adding a new recipe with an image."""
    try:
        data = request.data  # Parse form data (including file)
        serializer = RecipeSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # Optionally, associate with request.user in your serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Update an existing recipe (PUT) with image support


@api_view(["PUT"])
@parser_classes([MultiPartParser, JSONParser])
@permission_classes([IsAuthenticated])
def update_recipe(request, recipe_id):
    """Updates a recipe's text and/or image."""
    recipe = get_object_or_404(Recipe, id=recipe_id)
    serializer = RecipeSerializer(
        recipe, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a recipe (DELETE)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_recipe(request, recipe_id):
    """Deletes a recipe by ID."""
    recipe = get_object_or_404(Recipe, id=recipe_id)
    if recipe.image:
        default_storage.delete(recipe.image.path)
    recipe.delete()
    return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
