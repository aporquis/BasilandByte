

from django.urls import path
from .views import add_recipe, get_recipes, update_recipe, delete_recipe

urlpatterns = [

    path("recipes/", get_recipes, name="get_recipes"),
    path("recipes/add-recipe/", add_recipe, name="add_recipe"),
    path("recipes/update/<int:recipe_id>/",
         update_recipe, name="update_recipe"),
    path("recipes/delete/<int:recipe_id>/",
         delete_recipe, name="delete_recipe"),
]
