from django.urls import path
from .views import add_recipe, get_recipes, update_recipe, delete_recipe

urlpatterns = [
    path("add-recipe/", add_recipe, name="add_recipe"),
    path("get-recipes/", get_recipes, name="get_recipes"),
    path("update-recipe/<int:recipe_id>/", update_recipe, name="update_recipe"), 
    path("delete-recipe/<int:recipe_id>/", delete_recipe, name="delete_recipe"),  
]