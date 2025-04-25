from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, WeeklyPlan, UserInventory, ShoppingListItem
from fractions import Fraction


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        username = validated_data["username"]
        email = validated_data["email"]

        try:
            user = User.objects.get(username=username, email=email)
            if not user.is_active:
                user.set_password(validated_data["password"])
                user.is_active = True
                user.save()
                return user
            else:
                raise serializers.ValidationError({"username": "This account already exists."})
        except User.DoesNotExist:
            user = User.objects.create_user(**validated_data)
            return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate (self,data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            if not user.is_active:
                raise AuthenticationFailed("Your account is deactivated. Please reactivate to continue.")
            return {"user":user}

        try:
            user = User.objects.get(username=username)
            if not user.is_active:
                raise AuthenticationFailed("Your account is deactivated. Please reactivate to continue.")
        except User.DoesNotExist:
            pass

        raise AuthenticationFailed("Invalid Credentials.")

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source='ingredient.ingredient_name', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient_name', 'quantity', 'unit']

    def parse_quantity_to_float(quantity_str):
        try:
            return float(Fraction(quantity_str.strip()))
        except Exception:
            raise ValueError("Invalid quantity format. Use values like '1', '1/2', or '1 1/2'")


class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.SerializerMethodField()
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
        return Recipe.objects.create(**validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def get_username(self, obj):
        return obj.user.username if obj.user else "Unknown User"


class SavedItemSerializer(serializers.ModelSerializer):
    recipe_name = serializers.CharField(
        source='recipe.recipe_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SavedItem
        fields = ['id', 'recipe', 'recipe_name',
                  'user', 'username', 'saved_at']


class WeeklyPlanSerializer(serializers.ModelSerializer):
    recipe_name = serializers.CharField(
        source='recipe.recipe_name', read_only=True)

    class Meta:
        model = WeeklyPlan
        fields = ['id', 'recipe', 'recipe_name',
                  'day', 'meal_type', 'created_at']


class UserInventorySerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source='ingredient.ingredient_name', read_only=True)
    food_group = serializers.CharField(
        source='ingredient.food_group.food_group_name', read_only=True)
    quantity_display = serializers.CharField(write_only=True)
    quantity = serializers.DecimalField(
        max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = UserInventory
        fields = ['id', 'user', 'ingredient', 'ingredient_name', 'food_group',
                  'quantity', 'quantity_display', 'unit', 'storage_location',
                  'added_at', 'expires_at', 'is_available']
        read_only_fields = ['user', 'added_at', 'quantity']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user

        display = validated_data.pop('quantity_display').strip()
        try:
            validated_data['quantity'] = float(Fraction(display))
        except ValueError:
            raise serializers.ValidationError({
                "quantity_display": "Enter a valid quantity like '1', '1/2', or '1 1/2'"
            })
        validated_data['quantity_display'] = display
        return super().create(validated_data)


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        # Changed 'image' to 'image_url'
        fields = ['id', 'ingredient_name', 'food_group',
                  'specific_species', 'image_url']
        read_only_fields = ['id']

    def create(self, validated_data):
        normalized_name = validated_data['ingredient_name'].strip().title()
        ingredient, _ = Ingredient.objects.get_or_create(
            ingredient_name__iexact=normalized_name,
            defaults={'ingredient_name': normalized_name, **validated_data}
        )
        return ingredient


class ShoppingListItemSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source='ingredient.ingredient_name', read_only=True)

    class Meta:
        model = ShoppingListItem
        fields = ['id', 'user', 'ingredient', 'ingredient_name',
                  'quantity', 'unit', 'is_purchased', 'added_at']
        read_only_fields = ['user', 'added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
