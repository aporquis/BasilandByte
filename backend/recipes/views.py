from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Recipe
from .serializers import RecipeSerializer

# Utility function to generate JWT tokens


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

# User Registration API


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Registers a new user and returns a JWT token"""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "User created successfully", "token": get_tokens_for_user(user)}, status=status.HTTP_201_CREATED)

# User Login API


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticates user and returns a JWT token"""
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"message": "Login successful!", "token": get_tokens_for_user(user)}, status=status.HTTP_200_OK)

# Fetch all recipes (GET) (Available to everyone)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_recipes(request):
    """Fetch all recipes (public endpoint)."""
    recipes = Recipe.objects.all()
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)

# Add a recipe (POST) (Only authenticated users)


@api_view(["POST"])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def add_recipe(request):
    """Handles adding a new recipe with an image."""
    data = request.data  # Parse form data (including file)
    serializer = RecipeSerializer(data=data, context={'request': request})

    if serializer.is_valid():
        # Assign the logged-in user to the recipe
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update an existing recipe (PUT) (Only the owner can update)


@api_view(["PUT"])
@parser_classes([MultiPartParser, JSONParser])
@permission_classes([IsAuthenticated])
def update_recipe(request, recipe_id):
    """Updates a recipe's text and/or image (only if the user owns it)."""
    recipe = get_object_or_404(Recipe, id=recipe_id)

    # Ensure the user is the owner of the recipe
    if recipe.user != request.user:
        return Response({"error": "You can only update your own recipes."}, status=status.HTTP_403_FORBIDDEN)

    serializer = RecipeSerializer(recipe, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a recipe (DELETE) (Only the owner can delete)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_recipe(request, recipe_id):
    """Deletes a recipe by ID (only if the user owns it)."""
    recipe = get_object_or_404(Recipe, id=recipe_id)

    # Ensure the user is the owner of the recipe
    if recipe.user != request.user:
        return Response({"error": "You can only delete your own recipes."}, status=status.HTTP_403_FORBIDDEN)

    # If the recipe has an image, delete it from storage
    if recipe.image:
        default_storage.delete(recipe.image.path)

    recipe.delete()
    return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
