from rest_framework import serializers
from .models import Recipe


class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # Make image optional

    class Meta:
        model = Recipe
        fields = "__all__"  # Includes the image field
