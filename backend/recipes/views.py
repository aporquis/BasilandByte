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
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, WeeklyPlan, LoginEvent, UserDeletion, UserInventory, ShoppingListItem, AccountReactivation
from .serializers import RecipeSerializer, UserRegisterSerializer, UserLoginSerializer, SavedItemSerializer, WeeklyPlanSerializer, UserInventorySerializer, IngredientSerializer, ShoppingListItemSerializer
from django.http import JsonResponse, HttpResponse
from fractions import Fraction
import json
import logging
import re

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

    if user:
        if not user.is_active:
            return Response({"detail": "Your account is deactivated. Please reactivate it."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"message": "Login successful!", "token": get_tokens_for_user(user)}, status=status.HTTP_200_OK)

    try:
        matched_user = User.objects.get(username=username)
        if not matched_user.is_active and matched_user.check_password(password):
            return Response({"detail":"Your account is deactivated. Please reactivate it."}, status=status.HTTP_403_FORBIDDEN)
    except User.DoesNotExist:
        pass
    return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
@permission_classes([AllowAny])
def reactivate_account(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            if user.is_active:
                return Response({"detail": "Account is already active."}, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = True
            user.save()

            #Remove already existing user deletion request
            UserDeletion.objects.filter(user=user).delete()

            AccountReactivation.objects.create(user=user)
            return Response({"detail":"Account sucessfully reactivated."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"detail": "No account found with that username."}, status=status.HTTP_404_NOT_FOUND)

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
@parser_classes([JSONParser, MultiPartParser])
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


@api_view(['POST'])
def log_login_event(request):
    # Log a login event without authentication requirement
    username = request.data.get('username')
    outcome = request.data.get('outcome')
    # Default to 'unknown' if not provided
    source = request.data.get('source', 'unknown')

    if not username or not outcome:
        return Response({'error': 'Username and outcome are required'}, status=status.HTTP_400_BAD_REQUEST)

    LoginEvent.objects.create(
        username=username,
        outcome=outcome,
        source=source
    )
    return Response({'message': 'Login event logged'}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_account_deletion(request):
    # User Requests deletion of account
    user = request.user
    if hasattr(user, 'deletion_request'):
        return Response({"error": "You have already requested account deletion. It will delete in 6 months from the time you deleted your account."}, status=status.HTTP_400_BAD_REQUEST)

    # Mark user as inactive
    user.is_active = False
    user.save()

    # Create deletion request record
    UserDeletion.objects.create(user=user)

    # Reassign user to Basil & Byte
    basil_byte_user, created = User.objects.get_or_create(
        username="basilandbyte",
        defaults={"email":"admin@basilandbyte.com","password":User.objects.make_random_password()}
    )
    Recipe.objects.filter(user=user).update(user=basil_byte_user)

    return Response({"message": "Account deletion requested successfully. Your account will be permanently deleted after 6 months."}, status=status.HTTP_200_OK)

# Added as of 4/4/2025 these are the views that are needed for the pantry models, named (userInventory)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_inventory(request):
    """Fetch all inventory items for the authenticated user."""
    user = request.user
    inventory_items = UserInventory.objects.filter(
        user=user).select_related('ingredient')
    serializer = UserInventorySerializer(
        inventory_items, many=True, context={'request': request})
    return Response(serializer.data)


# In backend/recipes/views.py (only add_to_inventory)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_inventory(request):
    try:
        ingredient_data = {
            'ingredient_name': request.data.get("ingredient_name")}
        if not ingredient_data['ingredient_name']:
            return Response({"error": "ingredient_name is required"}, status=status.HTTP_400_BAD_REQUEST)
        ingredient_serializer = IngredientSerializer(data=ingredient_data)
        if not ingredient_serializer.is_valid():
            logger.error(
                f"Ingredient validation failed: {ingredient_serializer.errors}")
            return Response(ingredient_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        ingredient = ingredient_serializer.save()
        #Get Data Display
        quantity_display = request.data.get("quantity_display", "").strip()
        if not quantity_display:
            return Response({"error": "quantity_display is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity_parsed = float(Fraction(quantity_display))
        except Exception:
            return Response({"error": "Invalid quantity format. Use values like '1', '1/2', or '1 1/2'."}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "ingredient": ingredient.id,
            "quantity_display": quantity_display,
            "quantity": quantity_parsed,
            "unit": request.data.get("unit"),
            "storage_location": request.data.get("storage_location", "pantry"),
            "expires_at": request.data.get("expires_at"),
        }
        if data["unit"] is None:
            return Response({"error": "unit is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserInventorySerializer(
            data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.error(f"UserInventory validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in add_to_inventory: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_inventory_item(request, inventory_id):
    """Update an existing inventory item."""
    try:
        inventory_item = UserInventory.objects.get(id=inventory_id, user= request.user)
    except UserInventory.DoesNotExist:
        return Response({"error": "Iventory item not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    if "quantity_display" in data:
        quantity_display = data.get("quantity_display", "").strip()
        try:
            quantity_parsed = float(Fraction(quantity_display))
        except Exception:
            return Response({"error":"Invalid quantity format. Use values like '1', '1/2', or '1 1/2'."}, status=status.HTTP_400_BAD_REQUEST)
        data["quantity"] = quantity_parsed
        data["quantity_display"] = quantity_display

    serializer = UserInventorySerializer(
        instance = inventory_item, data=data, context = {'request': request}, partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_inventory_item(request, inventory_id):
    """Delete an inventory item."""
    inventory_item = get_object_or_404(
        UserInventory, id=inventory_id, user=request.user)
    inventory_item.delete()
    return Response({"message": "Inventory item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


def convert_units(quantity, from_unit, to_unit):
    # Simple conversion table (expand as needed)
    conversions = {
        # Approximate, depends on ingredient
        ('grams', 'cups'): lambda q: q / 240,
        ('cups', 'grams'): lambda q: q * 240,
    }
    if from_unit == to_unit:
        return quantity
    key = (from_unit, to_unit)
    if key in conversions:
        return conversions[key](quantity)
    return None  # No conversion available


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggest_recipes(request):
    """Suggest recipes based on user's inventory with fuzzy name matching."""
    user = request.user
    inventory = UserInventory.objects.filter(user=user, is_available=True)
    if not inventory.exists():
        return Response({"message": "No items in inventory to suggest recipes", "suggested_recipes": []}, status=status.HTTP_200_OK)

    # Normalize inventory ingredient names
    inventory_dict = {}
    for item in inventory:
        name = item.ingredient.ingredient_name.lower()
        # Remove common modifiers
        name = re.sub(r'\b(finely|shredded|cooked|boneless|skinless|chopped|sliced)\b',
                      '', name, flags=re.IGNORECASE).strip()
        inventory_dict[item.ingredient.id] = {
            "name": name,
            "quantity": float(item.quantity),
            "unit": item.unit,
            "original_name": item.ingredient.ingredient_name
        }

    recipes = Recipe.objects.all().prefetch_related('recipe_ingredients__ingredient')
    suggested_recipes = []
    for recipe in recipes:
        recipe_ingredients = recipe.recipe_ingredients.all()
        can_make = True
        missing_ingredients = []
        matched_ingredient_ids = set()

        for ri in recipe_ingredients:
            ingredient_id = ri.ingredient.id
            try:
                required_quantity = float(Fraction(ri.quantity.strip()))
                required_quantity_str = str(Fraction(ri.quantity.strip()).limit_denominator())
            except Exception as e:
                logger.warning(
                    f"Skipping recipe '{recipe.recipe_name}' due to invalid quantity '{ri.quantity}' (ingredient: {ri.ingredient.ingredient_name}): {e}"
                    f"(ingredient: {ri.ingredient.ingredient_name}): {e}"
                )
                can_make = False
                continue
            required_unit = ri.unit
            recipe_name = ri.ingredient.ingredient_name.lower()
            # Normalize recipe ingredient name
            normalized_recipe_name = re.sub(
                r'\b(finely|shredded|cooked|boneless|skinless|chopped|sliced)\b', '', recipe_name, flags=re.IGNORECASE).strip()

            # Check for match by ID or name
            found_match = False
            for inv_id, inv_data in inventory_dict.items():
                if inv_id == ingredient_id or normalized_recipe_name in inv_data["name"] or inv_data["name"] in normalized_recipe_name:
                    if inv_id in matched_ingredient_ids:
                        continue  # Skip if already used
                    # Simplified unit check (relaxed for now)
                    available_quantity = inv_data["quantity"]
                    if available_quantity < required_quantity:
                        can_make = False
                        missing_ingredients.append({
                            "ingredient_name": ri.ingredient.ingredient_name,
                            "required_quantity": required_quantity_str,
                            "unit": required_unit,
                            "available_quantity": str(Fraction(available_quantity).limit_denominator()),
                            "available_unit": inv_data["unit"]
                        })
                    else:
                        matched_ingredient_ids.add(inv_id)
                    found_match = True
                    break

            if not found_match:
                can_make = False
                missing_ingredients.append({
                    "ingredient_name": ri.ingredient.ingredient_name,
                    "required_quantity": required_quantity,
                    "unit": required_unit
                })

        if can_make or (len(missing_ingredients) <= 2):
            suggested_recipes.append({
                "recipe": RecipeSerializer(recipe, context={'request': request}).data,
                "can_make": can_make,
                "missing_ingredients": missing_ingredients
            })

    suggested_recipes.sort(key=lambda x: x["can_make"], reverse=True)
    return Response({
        "suggested_recipes": suggested_recipes,
        "inventory_count": inventory.count()
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_ingredients(request):
    ingredients = Ingredient.objects.all()
    serializer = IngredientSerializer(ingredients, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_shopping_list(request):
    """Add an item to the user's shopping list."""
    try:
        ingredient_data = {
            'ingredient_name': request.data.get("ingredient_name")}
        if not ingredient_data['ingredient_name']:
            return Response({"error": "ingredient_name is required"}, status=status.HTTP_400_BAD_REQUEST)
        ingredient_serializer = IngredientSerializer(data=ingredient_data)
        if not ingredient_serializer.is_valid():
            logger.error(
                f"Ingredient validation failed: {ingredient_serializer.errors}")
            return Response(ingredient_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        ingredient = ingredient_serializer.save()
        data = {
            "ingredient": ingredient.id,
            "quantity": request.data.get("quantity"),
            "unit": request.data.get("unit"),
            "is_purchased": request.data.get("is_purchased", False),
        }
        if data["quantity"] is None or not data["unit"]:
            logger.error(
                f"Invalid data: quantity={data['quantity']}, unit={data['unit']}")
            return Response({"error": "quantity and unit are required"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ShoppingListItemSerializer(
            data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(
            f"ShoppingListItem validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in add_to_shopping_list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_shopping_list(request):
    """Fetch all shopping list items for the authenticated user."""
    user = request.user
    items = ShoppingListItem.objects.filter(
        user=user).select_related('ingredient')
    serializer = ShoppingListItemSerializer(
        items, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_shopping_list_item(request, item_id):
    """Update a shopping list item (e.g., toggle purchased status)."""
    item = get_object_or_404(ShoppingListItem, id=item_id, user=request.user)
    serializer = ShoppingListItemSerializer(
        item, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_shopping_list_item(request, item_id):
    """Delete a shopping list item."""
    item = get_object_or_404(ShoppingListItem, id=item_id, user=request.user)
    item.delete()
    return Response({"message": "Shopping list item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_missing_ingredients_to_shopping_list(request, recipe_id):
    """Add missing ingredients from a saved recipe to the shopping list."""
    user = request.user
    saved_item = get_object_or_404(SavedItem, recipe_id=recipe_id, user=user)
    recipe = saved_item.recipe
    inventory = UserInventory.objects.filter(user=user, is_available=True)
    inventory_dict = {}
    for item in inventory:
        name = item.ingredient.ingredient_name.lower()
        name = re.sub(r'\b(finely|shredded|cooked|boneless|skinless|chopped|sliced)\b',
                      '', name, flags=re.IGNORECASE).strip()
        inventory_dict[item.ingredient.id] = {
            "name": name,
            "quantity": float(item.quantity),
            "unit": item.unit
        }
    recipe_ingredients = recipe.recipe_ingredients.all()
    added_items = []
    for ri in recipe_ingredients:
        ingredient_id = ri.ingredient.id
        try:
            required_quantity = float(Fraction(ri.quantity.strip()))
        except Exception as e:
            logger.warning(f"Invalid quantity '{ri.quantity}' in recipe {recipe.id}: {e}")
            continue
        required_unit = ri.unit
        recipe_name = ri.ingredient.ingredient_name.lower()
        normalized_recipe_name = re.sub(
            r'\b(finely|shredded|cooked|boneless|skinless|chopped|sliced)\b', '', recipe_name, flags=re.IGNORECASE).strip()
        found_match = False
        for inv_id, inv_data in inventory_dict.items():
            if inv_id == ingredient_id or normalized_recipe_name in inv_data["name"] or inv_data["name"] in normalized_recipe_name:
                available_quantity = inv_data["quantity"]
                if available_quantity >= required_quantity:
                    found_match = True
                break
        if not found_match:
            # Check if already in shopping list
            existing_item = ShoppingListItem.objects.filter(
                user=user, ingredient=ri.ingredient, is_purchased=False
            ).first()
            if existing_item:
                continue  # Skip duplicates
            data = {
                "ingredient": ingredient_id,
                "quantity": required_quantity,
                "unit": required_unit,
                "is_purchased": False,
            }
            serializer = ShoppingListItemSerializer(
                data=data, context={'request': request})
            if serializer.is_valid():
                item = serializer.save(user=user)
                added_items.append(serializer.data)
            else:
                logger.error(
                    f"ShoppingListItem validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "Added missing ingredients", "items": added_items}, status=status.HTTP_201_CREATED)
