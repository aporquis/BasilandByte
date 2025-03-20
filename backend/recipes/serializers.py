from django.contrib.auth.models import User
from rest_framework import serializers
<<<<<<< HEAD
from .models import Recipe
class UserRegisterSerializer(serializers.ModelSerializer): #serializer for registering a new user
=======
from .models import Recipe, Ingredient, RecipeIngredient, FoodGroup, SavedItem, WeeklyPlan


class UserRegisterSerializer(serializers.ModelSerializer):
>>>>>>> origin/main
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
<<<<<<< HEAD
        validated_data.pop("password2")  # Remove password2 field before saving
        user = User.objects.create_user(**validated_data)
        return user
    
class UserLoginSerializer(serializers.Serializer): #serializer for users that already have an account and want to login.
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class RecipeSerializer(serializers.ModelSerializer): #serializer for recipes
    image = serializers.ImageField(required=False) #gives the user the ability to add a recipe and NOT have to include an image. 
    user = serializers.StringRelatedField(read_only=True)  # shows the username
=======
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
>>>>>>> origin/main

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
<<<<<<< HEAD
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
=======
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
>>>>>>> origin/main
