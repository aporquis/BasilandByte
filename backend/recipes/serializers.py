from rest_framework import serializers
from .models import Recipe

class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False) #gives the user the ability to add a recipe and NOT have to include an image.
    user = serializers.StringRelatedField(read_only=True)  # shows the username

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
