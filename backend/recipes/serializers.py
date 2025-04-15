from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, WeeklyPlan, UserInventory


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
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source='ingredient.ingredient_name', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient_name', 'quantity', 'unit']


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

    class Meta:
        model = UserInventory
        fields = [
            'id', 'user', 'ingredient', 'ingredient_name', 'food_group',
            'quantity', 'unit', 'storage_location', 'added_at', 'expires_at',
            'is_available'
        ]
        # User is set automatically, added_at is auto-generated
        read_only_fields = ['user', 'added_at']

    def create(self, validated_data):
        # Automatically set the user to the authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

# For specific ingredients that users have
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'ingredient_name',
                  'food_group', 'specific_species', 'image']
        read_only_fields = ['id']

    def create(self, validated_data):
        normalized_name = validated_data['ingredient_name'].strip().title()
        ingredient, _ = Ingredient.objects.get_or_create(
            ingredient_name__iexact=normalized_name,
            defaults={'ingredient_name': normalized_name, **validated_data}
        )
        return ingredient
