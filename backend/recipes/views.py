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
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, WeeklyPlan
from .serializers import RecipeSerializer, UserRegisterSerializer, UserLoginSerializer, SavedItemSerializer, WeeklyPlanSerializer
from django.http import JsonResponse, HttpResponse
import json
import logging

logger = logging.getLogger(__name__)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


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
    response = HttpResponse(json.dumps(user_data, indent=4),
                            content_type="application/json")
    response['Content-Disposition'] = f'attachment; filename="{user.username}_data.json"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({"username": user.username})


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
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
    return Response({"message": "User created successfully", "tokens": tokens}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"message": "Login successful!", "token": get_tokens_for_user(user)}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_recipes(request):
    recipes = Recipe.objects.all()
    if request.query_params.get('user') and request.user.is_authenticated:
        recipes = recipes.filter(user=request.user)
    serializer = RecipeSerializer(
        recipes, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["POST"])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def add_recipe(request):
    data = request.data
    serializer = RecipeSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        validated_data = serializer.validated_data
        validated_data['user'] = request.user
        recipe = serializer.save()
        return Response(RecipeSerializer(recipe, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_recipe_ingredient(request):
    recipe_id = request.data.get("recipe_id")
    ingredient_name = request.data.get("ingredient_name")
    quantity = request.data.get("quantity")
    unit = request.data.get("unit")

    if not all([recipe_id, ingredient_name, quantity, unit]):
        return Response({"error": "recipe_id, ingredient_name, quantity, and unit are required"}, status=status.HTTP_400_BAD_REQUEST)

    recipe = get_object_or_404(Recipe, id=recipe_id, user=request.user)
    ingredient, _ = Ingredient.objects.get_or_create(
        ingredient_name=ingredient_name)
    recipe_ingredient = RecipeIngredient.objects.create(
        recipe=recipe,
        ingredient=ingredient,
        quantity=quantity,
        unit=unit
    )
    return Response({"message": "Ingredient added"}, status=status.HTTP_201_CREATED)


@api_view(["PUT"])
@parser_classes([MultiPartParser, JSONParser])
@permission_classes([IsAuthenticated])
def update_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    if recipe.user != request.user:
        return Response({"error": "You can only update your own recipes."}, status=status.HTTP_403_FORBIDDEN)
    serializer = RecipeSerializer(
        recipe, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_recipe(request, recipe_id):
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_recipe(request):
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_saved_recipes(request):
    user = request.user
    saved_items = SavedItem.objects.filter(user=user).select_related('recipe')
    serializer = SavedItemSerializer(
        saved_items, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unsave_recipe(request, saved_item_id):
    logger.info(
        f"Attempting to unsave recipe with saved_item_id {saved_item_id} for user {request.user.username}")
    saved_item = get_object_or_404(
        SavedItem, id=saved_item_id, user=request.user)
    saved_item.delete()
    logger.info(
        f"Unsaved recipe with saved_item_id {saved_item_id} for user {request.user.username}")
    return Response({"message": "Recipe unsaved successfully"}, status=status.HTTP_204_NO_CONTENT)

# Weekly Planner Endpoints


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_weekly_plan(request):
    """Add a recipe to the weekly plan."""
    recipe_id = request.data.get("recipe_id")
    day = request.data.get("day")
    meal_type = request.data.get("meal_type")

    if not all([recipe_id, day, meal_type]):
        return Response({"error": "recipe_id, day, and meal_type are required"}, status=status.HTTP_400_BAD_REQUEST)

    recipe = get_object_or_404(Recipe, id=recipe_id)
    user = request.user

    # Check if the day already has 3 meals
    existing_plans = WeeklyPlan.objects.filter(user=user, day=day)
    if existing_plans.count() >= 3:
        return Response({"error": f"Cannot add more than 3 meals to {day}"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if meal_type is already taken for the day
    if WeeklyPlan.objects.filter(user=user, day=day, meal_type=meal_type).exists():
        return Response({"error": f"{meal_type} already planned for {day}"}, status=status.HTTP_400_BAD_REQUEST)

    weekly_plan = WeeklyPlan.objects.create(
        user=user, recipe=recipe, day=day, meal_type=meal_type)
    return Response(WeeklyPlanSerializer(weekly_plan).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_weekly_plan(request):
    """Fetch the weekly plan for the authenticated user."""
    user = request.user
    plans = WeeklyPlan.objects.filter(user=user).select_related('recipe')
    serializer = WeeklyPlanSerializer(
        plans, many=True, context={'request': request})
    # Group by day
    plan_by_day = {}
    for plan in serializer.data:
        day = plan['day']
        if day not in plan_by_day:
            plan_by_day[day] = []
        plan_by_day[day].append(plan)
    return Response(plan_by_day)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_weekly_plan(request):
    """Clear all meals from the weekly plan."""
    user = request.user
    WeeklyPlan.objects.filter(user=user).delete()
    return Response({"message": "Weekly plan cleared"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_day_plan(request, day):
    """Clear all meals for a specific day."""
    user = request.user
    WeeklyPlan.objects.filter(user=user, day=day).delete()
    return Response({"message": f"{day} plan cleared"}, status=status.HTTP_204_NO_CONTENT)
