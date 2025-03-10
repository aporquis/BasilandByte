# backend/recipes/views.py
# Views for user authentication, user data, recipe management, and saved items.

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
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem
from .serializers import RecipeSerializer, UserRegisterSerializer, UserLoginSerializer, SavedItemSerializer
from django.http import JsonResponse, HttpResponse
import json
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Generates the needed tokens for users to log into the website.


def get_tokens_for_user(user):
    """Generate JWT tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# View used to download all user data for a specific logged-in user to a JSON file for viewing.


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_user_data(request):
    """Export user data as a JSON file for download."""
    user = request.user

    user_data = {
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
    }

    response = HttpResponse(json.dumps(user_data, indent=4),
                            content_type="application/json")
    response['Content-Disposition'] = f'attachment; filename="{user.username}_data.json"'
    return response

# Gathers the user's username and sends it to the dashboard page to show the user that they have successfully logged into their specific account


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """Fetch the username of the logged-in user for display on the dashboard."""
    user = request.user
    return Response({"username": user.username})

# User registration view, allows users to enter information to create an account if the username is not taken and all fields are filled.


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Registers a new user with first name, last name, email, and password."""
    username = request.data.get("username")
    password = request.data.get("password")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")

    if not all([username, password, first_name, last_name, email]):
        return Response({"error": "All fields (username, password, first name, last name, email) are required"},
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email is already in use"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email
    )

    tokens = get_tokens_for_user(user)

    return Response({
        "message": "User created successfully",
        "tokens": tokens
    }, status=status.HTTP_201_CREATED)

# View for logging into an EXISTING user account, won't let you login if blank or if not in the database!


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticates user and returns a JWT token."""
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
    """Fetch all recipes (public endpoint) with username included, optionally filtered by user."""
    recipes = Recipe.objects.all()
    if request.query_params.get('user') and request.user.is_authenticated:
        recipes = recipes.filter(user=request.user)
    serializer = RecipeSerializer(
        recipes, many=True, context={'request': request})
    return Response(serializer.data)

# Add a recipe (POST) (Only authenticated users)


@api_view(["POST"])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def add_recipe(request):
    """Handles adding a new recipe with an optional image."""
    data = request.data
    serializer = RecipeSerializer(data=data, context={'request': request})

    if serializer.is_valid():
        validated_data = serializer.validated_data
        validated_data['user'] = request.user
        try:
            serializer.save()
            return Response({"message": "Recipe added successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update an existing recipe (PUT) (Only the owner can update)


@api_view(["PUT"])
@parser_classes([MultiPartParser, JSONParser])
@permission_classes([IsAuthenticated])
def update_recipe(request, recipe_id):
    """Updates a recipe's text and/or image (only if the user owns it)."""
    recipe = get_object_or_404(Recipe, id=recipe_id)

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
    logger.info(
        f"Attempting to delete recipe {recipe_id} for user {request.user.username}")
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if recipe.user != request.user:
        logger.warning(
            f"Permission denied for user {request.user.username} on recipe {recipe_id}")
        return Response({"error": "You can only delete your own recipes."}, status=status.HTTP_403_FORBIDDEN)

    if recipe.image:
        default_storage.delete(recipe.image.path)

    recipe.delete()
    logger.info(f"Deleted recipe {recipe_id} for user {request.user.username}")
    return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# Save a recipe (POST) (Only authenticated users)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_recipe(request):
    """Save a recipe for the authenticated user."""
    recipe_id = request.data.get("recipe_id")
    if not recipe_id:
        return Response({"error": "Recipe ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        recipe = get_object_or_404(Recipe, id=recipe_id)
        user = request.user
        saved_item, created = SavedItem.objects.get_or_create(
            user=user, recipe=recipe)
        if created:
            return Response({"message": "Recipe saved successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Recipe already saved"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Get saved recipes (GET) (Only authenticated users)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_saved_recipes(request):
    """Fetch all saved recipes for the authenticated user."""
    user = request.user
    saved_items = SavedItem.objects.filter(user=user).select_related('recipe')
    serializer = SavedItemSerializer(
        saved_items, many=True, context={'request': request})
    return Response(serializer.data)

# Unsave a recipe (DELETE) (Only authenticated users)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unsave_recipe(request, saved_item_id):
    """Unsave a recipe for the authenticated user."""
    logger.info(
        f"Attempting to unsave recipe with saved_item_id {saved_item_id} for user {request.user.username}")
    saved_item = get_object_or_404(
        SavedItem, id=saved_item_id, user=request.user)
    saved_item.delete()
    logger.info(
        f"Unsaved recipe with saved_item_id {saved_item_id} for user {request.user.username}")
    return Response({"message": "Recipe unsaved successfully"}, status=status.HTTP_204_NO_CONTENT)
