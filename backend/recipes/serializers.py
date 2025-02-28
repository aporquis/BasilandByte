from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Recipe
class UserRegisterSerializer(serializers.ModelSerializer): #serializer for registering a new user
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
        validated_data.pop("password2")  # Remove password2 field before saving
        user = User.objects.create_user(**validated_data)
        return user
    
class UserLoginSerializer(serializers.Serializer): #serializer for users that already have an account and want to login.
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class RecipeSerializer(serializers.ModelSerializer): #serializer for recipes
    image = serializers.ImageField(required=False) #gives the user the ability to add a recipe and NOT have to include an image. 
    user = serializers.StringRelatedField(read_only=True)  # shows the username

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
