# backend/recipes/serializers.py
# Serializers for user registration, login, and recipes.

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Recipe


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering a new user."""
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        """Validate that the two password fields match."""
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """Create a new user with the validated data."""
        validated_data.pop("password2")  # Remove password2 field before saving
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RecipeSerializer(serializers.ModelSerializer):
    """Serializer for recipes."""
    image = serializers.ImageField(required=False)  # Optional image field
    user = serializers.PrimaryKeyRelatedField(
        read_only=True)  # User ID (read-only)
    username = serializers.SerializerMethodField()  # Add username field

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
        """Create a new recipe with the validated data."""
        # User is set in the view, so no need to pass it here
        return Recipe.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update an existing recipe with the validated data."""
        return super().update(instance, validated_data)

    def get_username(self, obj):
        """Return the username of the recipe's user."""
        return obj.user.username if obj.user else "Unknown User"
