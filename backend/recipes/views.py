from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Recipe
from .serializers import RecipeSerializer
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse #for exporting data just like below!
import json #for our data download for users!

#Generates the needed tokens for users to log into website.
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
#View used to download all user data for specific logged in user to a Json file for viewing.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_user_data(request):
    user = request.user

    user_data = {
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
    }

    # Convert data to JSON and force download of a file for easy user readability and access
    response = HttpResponse(json.dumps(user_data, indent=4),
                            content_type="application/json")
    response['Content-Disposition'] = f'attachment; filename="{user.username}_data.json"'

    return response

#Gathers the users user name and sends it to the dashboard page to show user that they have successfully logged into their specific account
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({"username": user.username})


# User registration view, allows for the user to enter all the following information below to create an account if username taken will not work, if all fields not filled will not work. 
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Registers a new user with first name, last name, email, and password."""
    username = request.data.get("username")
    password = request.data.get("password")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    email = request.data.get("email")

    # Check if all fields are provided
    if not all([username, password, first_name, last_name, email]):
        return Response({"error": "All fields (username, password, first name, last name, email) are required"},
                        status=status.HTTP_400_BAD_REQUEST)

    # Check if the username or email already exists
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email is already in use"}, status=status.HTTP_400_BAD_REQUEST)

    # Create user with additional fields added these on 2/27/25 to ensure that user has more information when downloaded like every standard registration
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email
    )

    # Generate authentication tokens for the new user
    tokens = get_tokens_for_user(user)

    return Response({
        "message": "User created successfully",
        "tokens": tokens
    }, status=status.HTTP_201_CREATED)

#View for logging into EXISTING user account, wont let you login if blank, or if not in the database !
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

# Update an existing recipe (PUT) (Only the owner can update) feature coming soon to edit recipes that you have saved on own instance, but that will be down the road
@api_view(["PUT"])
@parser_classes([MultiPartParser, JSONParser])
@permission_classes([IsAuthenticated])
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
