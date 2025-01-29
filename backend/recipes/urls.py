from django.urls import path
from .views import add_recipe, get_recipes

urlpatterns = [
    path("add-recipe/", add_recipe, name="add_recipe"),
    path("get-recipes/", get_recipes, name="get_recipes")
]