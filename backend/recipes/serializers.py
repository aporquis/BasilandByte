from rest_framework import serializers
from .models import Recipe


class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    user = serializers.StringRelatedField(read_only=True)  # shows the username

    class Meta:
        model = Recipe
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get('request')
        # Automatically assign the logged-in user
        return Recipe.objects.create(user=request.user, **validated_data)
